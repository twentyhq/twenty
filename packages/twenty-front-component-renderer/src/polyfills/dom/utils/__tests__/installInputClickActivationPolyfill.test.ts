import { remoteId } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { FILE_INPUT_PICKER_METHOD } from '@/constants/FileInputPickerMethod';
import { HtmlInputElement } from '@/remote/generated/remote-elements';
import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';
import { markEventAsHostOriginated } from '@/polyfills/events/utils/markEventAsHostOriginated';
import { workerFileInputActivation } from '@/polyfills/file-input/states/workerFileInputActivation';

import { installInputClickActivationPolyfill } from '../installInputClickActivationPolyfill';
import { installElementClickMethodPolyfill } from '../installElementClickMethodPolyfill';

patchRemoteElementAttributes();
installElementClickMethodPolyfill(HtmlInputElement.prototype);
installInputClickActivationPolyfill(HtmlInputElement.prototype);

const createInput = ({
  type,
  name,
  checked = false,
}: {
  type: string;
  name?: string;
  checked?: boolean;
}): HTMLInputElement => {
  const input = document.createElement('html-input') as HTMLInputElement;

  input.type = type;
  input.checked = checked;

  if (isDefined(name)) {
    input.name = name;
  }

  return input;
};

const createClickEvent = (): MouseEvent =>
  new MouseEvent('click', { bubbles: true, cancelable: true });

const createConnectedFileInput = () => {
  const remoteRoot = document.createElement('remote-root');
  const input = createInput({ type: 'file' });
  const connection = { mutate: jest.fn(), call: jest.fn() };

  remoteRoot.append(input);
  document.body.append(remoteRoot);
  remoteRoot.connect(connection);

  return { remoteRoot, input, connection };
};

const clickWithHostActivation = (click: () => void): void => {
  const hostClickEvent = createClickEvent();

  workerFileInputActivation.register({
    event: hostClickEvent,
    activationId: 'trusted-click',
  });
  workerFileInputActivation.dispatch({
    event: hostClickEvent,
    dispatch: () => {
      click();
      return true;
    },
  });
};

const recordEventTypes = (input: HTMLInputElement): string[] => {
  const eventTypes: string[] = [];

  for (const eventType of ['click', 'input', 'change']) {
    input.addEventListener(eventType, (event) => {
      eventTypes.push(`${event.type}:${input.checked}`);
    });
  }

  return eventTypes;
};

describe('installInputClickActivationPolyfill', () => {
  it.each(['checkbox', 'radio'])(
    'should suppress recursive %s clicks without duplicating activation events',
    (type) => {
      const input = createInput({ type });
      const eventTypes = recordEventTypes(input);

      input.addEventListener('click', () => {
        if (eventTypes.length === 1) {
          input.click();
        }
      });

      input.click();

      expect(input.checked).toBe(true);
      expect(eventTypes).toEqual(['click:true', 'input:true', 'change:true']);
    },
  );

  it('should toggle a checkbox and fire input then change after a guest click', () => {
    const checkbox = createInput({ type: 'checkbox' });
    const eventTypes = recordEventTypes(checkbox);

    checkbox.dispatchEvent(createClickEvent());

    expect(checkbox.checked).toBe(true);
    expect(eventTypes).toEqual(['click:true', 'input:true', 'change:true']);

    checkbox.dispatchEvent(createClickEvent());

    expect(checkbox.checked).toBe(false);
    expect(eventTypes).toEqual([
      'click:true',
      'input:true',
      'change:true',
      'click:false',
      'input:false',
      'change:false',
    ]);
  });

  it('should dispatch bubbling change events carrying react compatibility', () => {
    const form = document.createElement('html-form') as HTMLFormElement;
    const checkbox = createInput({ type: 'checkbox' });
    const changeListener = jest.fn();

    form.append(checkbox);
    form.addEventListener('change', changeListener);

    checkbox.dispatchEvent(createClickEvent());

    expect(changeListener).toHaveBeenCalledTimes(1);
    const [changeEvent] = changeListener.mock.calls[0];
    expect(changeEvent.bubbles).toBe(true);
    expect(changeEvent.target).toBe(checkbox);
    expect(changeEvent.nativeEvent).toBe(changeEvent);
    expect(changeEvent.isDefaultPrevented()).toBe(false);
  });

  it('should clear the indeterminate state on activation', () => {
    const checkbox = createInput({ type: 'checkbox' });

    checkbox.indeterminate = true;
    checkbox.dispatchEvent(createClickEvent());

    expect(checkbox.indeterminate).toBe(false);
    expect(checkbox.checked).toBe(true);
  });

  it('should restore the checkbox when a click listener prevents the default', () => {
    const checkbox = createInput({ type: 'checkbox' });
    const changeListener = jest.fn();

    checkbox.indeterminate = true;
    checkbox.addEventListener('click', (event) => event.preventDefault());
    checkbox.addEventListener('change', changeListener);

    checkbox.dispatchEvent(createClickEvent());

    expect(checkbox.checked).toBe(false);
    expect(checkbox.indeterminate).toBe(true);
    expect(changeListener).not.toHaveBeenCalled();
  });

  it('should leave a disabled checkbox untouched while still delivering the click', () => {
    const checkbox = createInput({ type: 'checkbox' });
    const clickListener = jest.fn();
    const changeListener = jest.fn();

    checkbox.disabled = true;
    checkbox.addEventListener('click', clickListener);
    checkbox.addEventListener('change', changeListener);

    checkbox.dispatchEvent(createClickEvent());

    expect(clickListener).toHaveBeenCalledTimes(1);
    expect(checkbox.checked).toBe(false);
    expect(changeListener).not.toHaveBeenCalled();
  });

  it('should not activate on clicks forwarded from the host', () => {
    const checkbox = createInput({ type: 'checkbox' });
    const changeListener = jest.fn();
    const hostClickEvent = createClickEvent();

    markEventAsHostOriginated(hostClickEvent);
    checkbox.addEventListener('change', changeListener);

    checkbox.dispatchEvent(hostClickEvent);

    expect(checkbox.checked).toBe(false);
    expect(changeListener).not.toHaveBeenCalled();
  });

  it('should open the file picker once with the host activation of a guest click', () => {
    const { remoteRoot, input, connection } = createConnectedFileInput();

    clickWithHostActivation(() => {
      input.click();
      input.click();
    });

    expect(connection.call).toHaveBeenCalledTimes(1);
    expect(connection.call).toHaveBeenCalledWith(
      remoteId(input),
      FILE_INPUT_PICKER_METHOD,
      'trusted-click',
    );

    remoteRoot.remove();
  });

  it('should not open the file picker without host activation or after a prevented click', () => {
    const { remoteRoot, input, connection } = createConnectedFileInput();

    input.click();
    input.addEventListener('click', (event) => event.preventDefault());
    clickWithHostActivation(() => input.click());

    expect(connection.call).not.toHaveBeenCalled();

    remoteRoot.remove();
  });

  it('should not activate text inputs or non-click events', () => {
    const textInput = createInput({ type: 'text' });
    const checkbox = createInput({ type: 'checkbox' });
    const focusListener = jest.fn();

    checkbox.addEventListener('focus', focusListener);

    textInput.dispatchEvent(createClickEvent());
    checkbox.dispatchEvent(new FocusEvent('focus'));

    expect(textInput.checked).toBe(false);
    expect(checkbox.checked).toBe(false);
    expect(focusListener).toHaveBeenCalledTimes(1);
  });

  it('should check a radio and uncheck the other radios of its group', () => {
    const form = document.createElement('html-form') as HTMLFormElement;
    const otherForm = document.createElement('html-form') as HTMLFormElement;
    const fieldset = document.createElement('html-fieldset') as HTMLElement;
    const daily = createInput({ type: 'radio', name: 'frequency' });
    const weekly = createInput({
      type: 'radio',
      name: 'frequency',
      checked: true,
    });
    const otherGroup = createInput({
      type: 'radio',
      name: 'plan',
      checked: true,
    });
    const otherFormRadio = createInput({
      type: 'radio',
      name: 'frequency',
      checked: true,
    });
    const eventTypes = recordEventTypes(daily);

    fieldset.append(weekly);
    form.append(daily, fieldset, otherGroup);
    otherForm.append(otherFormRadio);
    document.body.append(form, otherForm);

    daily.dispatchEvent(createClickEvent());

    expect(daily.checked).toBe(true);
    expect(weekly.checked).toBe(false);
    expect(otherGroup.checked).toBe(true);
    expect(otherFormRadio.checked).toBe(true);
    expect(eventTypes).toEqual(['click:true', 'input:true', 'change:true']);

    form.remove();
    otherForm.remove();
  });

  it('should group radios through their form attribute in both directions', () => {
    const form = document.createElement('html-form') as HTMLFormElement;
    const sidebar = document.createElement('html-div') as HTMLElement;
    const inForm = createInput({
      type: 'radio',
      name: 'frequency',
      checked: true,
    });
    const outsideForm = createInput({ type: 'radio', name: 'frequency' });

    form.id = 'digest';
    outsideForm.setAttribute('form', 'digest');
    form.append(inForm);
    sidebar.append(outsideForm);
    document.body.append(form, sidebar);

    outsideForm.dispatchEvent(createClickEvent());

    expect(outsideForm.checked).toBe(true);
    expect(inForm.checked).toBe(false);

    inForm.dispatchEvent(createClickEvent());

    expect(inForm.checked).toBe(true);
    expect(outsideForm.checked).toBe(false);

    form.remove();
    sidebar.remove();
  });

  it('should keep radios with different form owners in separate groups', () => {
    const form = document.createElement('html-form') as HTMLFormElement;
    const inForm = createInput({
      type: 'radio',
      name: 'frequency',
      checked: true,
    });
    const disowned = createInput({ type: 'radio', name: 'frequency' });
    const documentLevel = createInput({
      type: 'radio',
      name: 'frequency',
      checked: true,
    });

    disowned.setAttribute('form', 'missing-form');
    form.append(inForm, disowned);
    document.body.append(form, documentLevel);

    disowned.dispatchEvent(createClickEvent());

    expect(disowned.checked).toBe(true);
    expect(documentLevel.checked).toBe(false);
    expect(inForm.checked).toBe(true);

    form.remove();
    documentLevel.remove();
  });

  it('should scope unformed radios to their document', () => {
    const container = document.createElement('html-div') as HTMLElement;
    const first = createInput({ type: 'radio', name: 'stage', checked: true });
    const second = createInput({ type: 'radio', name: 'stage' });

    container.append(first, second);
    document.body.append(container);

    second.dispatchEvent(createClickEvent());

    expect(first.checked).toBe(false);
    expect(second.checked).toBe(true);

    container.remove();
  });

  it('should uncheck a group radio that is only checked through its attribute', () => {
    const container = document.createElement('html-div') as HTMLElement;
    const daily = createInput({ type: 'radio', name: 'frequency' });
    const weekly = createInput({ type: 'radio', name: 'frequency' });

    weekly.setAttribute('checked', '');
    Object.defineProperty(weekly, 'checked', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    container.append(daily, weekly);
    document.body.append(container);

    daily.dispatchEvent(createClickEvent());

    expect(daily.checked).toBe(true);
    expect(weekly.checked).toBe(false);

    container.remove();
  });

  it('should uncheck a checkbox that is only checked through its attribute', () => {
    const checkbox = createInput({ type: 'checkbox' });

    checkbox.setAttribute('checked', '');
    Object.defineProperty(checkbox, 'checked', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    checkbox.dispatchEvent(createClickEvent());

    expect(checkbox.checked).toBe(false);
  });

  it('should fire no change when an already checked radio is clicked', () => {
    const radio = createInput({ type: 'radio', name: 'stage', checked: true });
    const eventTypes = recordEventTypes(radio);

    radio.dispatchEvent(createClickEvent());

    expect(radio.checked).toBe(true);
    expect(eventTypes).toEqual(['click:true']);
  });

  it('should restore the previously checked radio when the click is prevented', () => {
    const container = document.createElement('html-div') as HTMLElement;
    const first = createInput({ type: 'radio', name: 'stage', checked: true });
    const second = createInput({ type: 'radio', name: 'stage' });
    const changeListener = jest.fn();

    container.append(first, second);
    document.body.append(container);
    second.addEventListener('click', (event) => event.preventDefault());
    second.addEventListener('change', changeListener);

    second.dispatchEvent(createClickEvent());

    expect(first.checked).toBe(true);
    expect(second.checked).toBe(false);
    expect(changeListener).not.toHaveBeenCalled();

    container.remove();
  });
});
