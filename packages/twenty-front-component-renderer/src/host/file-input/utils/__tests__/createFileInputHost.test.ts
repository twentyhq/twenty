import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';

import { createFileInputHost } from '../createFileInputHost';

type RecordClick = (event: Pick<MouseEvent, 'isTrusted' | 'target'>) => void;

const userActivation = { isActive: true };
const disposeHosts: (() => void)[] = [];

const createFixture = () => {
  const addEventListener = jest.spyOn(document, 'addEventListener');
  const geometryTracker = createGeometryTracker();
  const host = createFileInputHost({ geometryTracker });
  const recordClick = addEventListener.mock.calls.find(
    ([eventType]) => eventType === 'click',
  )?.[1] as RecordClick;
  addEventListener.mockRestore();
  disposeHosts.push(host.dispose);

  const button = document.createElement('button');
  const input = document.createElement('input');
  input.type = 'file';
  document.body.append(button, input);
  geometryTracker.registerNode('button', button);
  geometryTracker.registerNode('input', input);
  const click = jest.spyOn(input, 'click').mockImplementation(() => undefined);

  return {
    host,
    input,
    button,
    click,
    recordClick,
    clickOwnedButton: () => recordClick({ isTrusted: true, target: button }),
  };
};

describe('createFileInputHost', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    userActivation.isActive = true;
    Object.defineProperty(navigator, 'userActivation', {
      configurable: true,
      value: userActivation,
    });
  });

  afterEach(() => {
    for (const disposeHost of disposeHosts.splice(0)) {
      disposeHost();
    }
    jest.useRealTimers();
    document.body.replaceChildren();
  });

  it('opens an owned file input once after a trusted click inside the renderer', () => {
    const { host, click, clickOwnedButton } = createFixture();
    clickOwnedButton();
    host.openFilePicker('input');
    host.openFilePicker('input');
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('ignores synthetic clicks and clicks outside the renderer', () => {
    const { host, button, click, recordClick } = createFixture();
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    recordClick({ isTrusted: true, target: document.body });
    host.openFilePicker('input');
    expect(click).not.toHaveBeenCalled();
  });

  it.each(['disabled', 'detached', 'non-file', 'unregistered', 'inactive'])(
    'rejects a %s destination after a trusted click',
    (state) => {
      const { host, input, click, clickOwnedButton } = createFixture();
      clickOwnedButton();
      if (state === 'disabled') {
        input.disabled = true;
      }
      if (state === 'detached') {
        input.remove();
      }
      if (state === 'non-file') {
        input.type = 'text';
      }
      if (state === 'inactive') {
        userActivation.isActive = false;
      }
      host.openFilePicker(state === 'unregistered' ? 'missing' : 'input');
      expect(click).not.toHaveBeenCalled();
    },
  );

  it('does not share a click between renderer instances', () => {
    const first = createFixture();
    const second = createFixture();
    const clickInFirstRenderer = { isTrusted: true, target: first.button };
    first.recordClick(clickInFirstRenderer);
    second.recordClick(clickInFirstRenderer);
    second.host.openFilePicker('input');
    first.host.openFilePicker('input');
    expect(second.click).not.toHaveBeenCalled();
    expect(first.click).toHaveBeenCalledTimes(1);
  });

  it('expires the click after one second', () => {
    const { host, click, clickOwnedButton } = createFixture();
    clickOwnedButton();
    jest.advanceTimersByTime(1001);
    host.openFilePicker('input');
    expect(click).not.toHaveBeenCalled();
  });

  it('stops listening to clicks on dispose', () => {
    const removeEventListener = jest.spyOn(document, 'removeEventListener');
    const { host, recordClick } = createFixture();
    host.dispose();
    expect(removeEventListener).toHaveBeenCalledWith(
      'click',
      recordClick,
      true,
    );
    removeEventListener.mockRestore();
  });
});
