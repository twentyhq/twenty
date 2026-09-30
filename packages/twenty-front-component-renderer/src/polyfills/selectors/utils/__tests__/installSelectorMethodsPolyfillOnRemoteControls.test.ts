import '@/remote/generated/remote-elements';

import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { installSelectorMethodsPolyfill } from '@/polyfills/selectors/utils/installSelectorMethodsPolyfill';
import { applySerializedEventTargetProperties } from '@/remote/elements/utils/applySerializedEventTargetProperties';
import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';

type RemoteElementWithProperties = HTMLElement & Record<string, unknown>;

const createRemoteElement = (tagName: string): RemoteElementWithProperties => {
  const element = document.createElement(
    tagName,
  ) as RemoteElementWithProperties;

  installSelectorMethodsPolyfill({
    elementPrototype: element,
    querySelectorTargets: [element],
    resolveActiveElement: () => null,
    resolveFocusVisibleElement: () => null,
  });

  return element;
};

const createRadio = (name: string): RemoteElementWithProperties => {
  const radio = createRemoteElement('html-input');

  radio.setAttribute('type', 'radio');
  radio.setAttribute('name', name);
  radio.setAttribute('checked', '');

  return radio;
};

describe('installSelectorMethodsPolyfill on remote control state', () => {
  beforeAll(() => {
    patchRemoteElementAttributes();
  });

  it('should uncheck only radios with the same name and form owner after a host event', () => {
    const root = createRemoteElement('html-div');
    const form = createRemoteElement('html-form');
    const otherForm = createRemoteElement('html-form');
    const firstRadio = createRadio('plan');
    const nextRadio = createRadio('plan');
    const externalRadio = createRadio('plan');
    const otherNameRadio = createRadio('billing');
    const otherFormRadio = createRadio('plan');
    const detachedRadio = createRadio('plan');
    const checkbox = createRemoteElement('html-input');
    const hostRadio = document.createElement('input');

    form.setAttribute('id', 'plan-form');
    externalRadio.setAttribute('form', 'plan-form');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('name', 'plan');
    checkbox.checked = true;
    nextRadio.checked = false;
    form.append(firstRadio, nextRadio, otherNameRadio, checkbox);
    otherForm.append(otherFormRadio);
    root.append(form, otherForm, externalRadio);
    hostRadio.type = 'radio';
    hostRadio.checked = true;

    applySerializedEventTargetProperties({
      element: nextRadio,
      eventData: serializeEvent({ type: 'change', target: hostRadio }),
    });

    expect(Array.from(root.querySelectorAll(':checked'))).toEqual([
      nextRadio,
      otherNameRadio,
      checkbox,
      otherFormRadio,
    ]);
    expect(detachedRadio.matches(':checked')).toBe(true);
    expect(firstRadio.matches('[checked]')).toBe(true);
    expect(externalRadio.checked).toBe(false);
  });

  it('should keep unnamed radios independent after a host event', () => {
    const root = createRemoteElement('html-div');
    const firstRadio = createRadio('');
    const nextRadio = createRadio('');

    root.append(firstRadio, nextRadio);
    nextRadio.checked = false;

    applySerializedEventTargetProperties({
      element: nextRadio,
      eventData: { type: 'change', checked: true },
    });

    expect(Array.from(root.querySelectorAll(':checked'))).toEqual([
      firstRadio,
      nextRadio,
    ]);
  });

  it('should preserve every selected option in a multiple select across host events', () => {
    const select = createRemoteElement('html-select');
    const optionGroup = createRemoteElement('html-optgroup');
    const firstOption = createRemoteElement('html-option');
    const duplicateOption = createRemoteElement('html-option');
    const lastOption = createRemoteElement('html-option');
    const hostSelect = document.createElement('select');
    const hostOptionGroup = document.createElement('optgroup');
    const hostFirstOption = document.createElement('option');
    const hostDuplicateOption = document.createElement('option');
    const hostLastOption = document.createElement('option');

    select.multiple = true;
    firstOption.value = 'duplicate';
    duplicateOption.value = 'duplicate';
    lastOption.value = 'last';
    firstOption.selected = true;
    lastOption.selected = true;
    select.value = 'duplicate';
    optionGroup.append(duplicateOption, lastOption);
    select.append(firstOption, optionGroup);

    expect(Array.from(select.querySelectorAll('option:checked'))).toEqual([
      firstOption,
      lastOption,
    ]);

    hostSelect.multiple = true;
    hostFirstOption.value = 'duplicate';
    hostDuplicateOption.value = 'duplicate';
    hostLastOption.value = 'last';
    hostOptionGroup.append(hostDuplicateOption, hostLastOption);
    hostSelect.append(hostFirstOption, hostOptionGroup);
    hostDuplicateOption.selected = true;
    hostLastOption.selected = true;

    applySerializedEventTargetProperties({
      element: select,
      eventData: serializeEvent({ type: 'change', target: hostSelect }),
    });

    expect(Array.from(select.querySelectorAll('option:checked'))).toEqual([
      duplicateOption,
      lastOption,
    ]);

    hostDuplicateOption.selected = false;
    hostLastOption.selected = false;

    applySerializedEventTargetProperties({
      element: select,
      eventData: serializeEvent({ type: 'change', target: hostSelect }),
    });

    expect(Array.from(select.querySelectorAll('option:checked'))).toEqual([]);
  });
});
