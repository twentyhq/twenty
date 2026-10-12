import { trackHostFocus } from '@/host/focus/utils/trackHostFocus';
import { createGeometryTrackerStub } from '@/testing/createGeometryTrackerStub';

const createFocusFixture = () => {
  const geometryTracker = createGeometryTrackerStub();
  const pushFocusUpdate = jest.fn();
  const button = document.createElement('button');
  const input = document.createElement('input');

  button.setAttribute('data-remote-id', 'button');
  input.setAttribute('data-remote-id', 'input');
  document.body.append(button, input);

  jest
    .spyOn(geometryTracker, 'findRemoteElementIdContainingNode')
    .mockImplementation((node) =>
      node instanceof Element
        ? (node.getAttribute('data-remote-id') ?? undefined)
        : undefined,
    );

  return {
    button,
    input,
    pushFocusUpdate,
    startTracking: () => trackHostFocus({ geometryTracker, pushFocusUpdate }),
  };
};

describe('trackHostFocus', () => {
  let stopTracking: (() => void) | undefined;

  afterEach(() => {
    stopTracking?.();
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  it('should forward native focus visibility and update it without a focus change', () => {
    const { button, pushFocusUpdate, startTracking } = createFocusFixture();
    const matches = jest.spyOn(button, 'matches').mockReturnValue(false);

    stopTracking = startTracking();
    button.focus();

    expect(matches).toHaveBeenCalledWith(':focus-visible');
    expect(pushFocusUpdate).toHaveBeenLastCalledWith({
      remoteElementId: 'button',
      isFocusVisible: false,
    });

    matches.mockReturnValue(true);
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
    );

    expect(pushFocusUpdate).toHaveBeenLastCalledWith({
      remoteElementId: 'button',
      isFocusVisible: true,
    });

    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', bubbles: true }),
    );

    expect(pushFocusUpdate).toHaveBeenCalledTimes(2);
  });

  it('should preserve native focus visibility when focus moves to a text input', () => {
    const { button, input, pushFocusUpdate, startTracking } =
      createFocusFixture();

    jest.spyOn(button, 'matches').mockReturnValue(false);
    jest.spyOn(input, 'matches').mockReturnValue(true);
    stopTracking = startTracking();
    button.focus();
    input.focus();

    expect(pushFocusUpdate.mock.calls).toEqual([
      [{ remoteElementId: 'button', isFocusVisible: false }],
      [{ remoteElementId: 'input', isFocusVisible: true }],
    ]);

    input.blur();

    expect(pushFocusUpdate).toHaveBeenLastCalledWith({
      remoteElementId: null,
      isFocusVisible: false,
    });
  });

  it('should synchronize focus present on mount and stop observing on cleanup', () => {
    const { button, input, pushFocusUpdate, startTracking } =
      createFocusFixture();

    jest.spyOn(button, 'matches').mockReturnValue(true);
    button.focus();
    stopTracking = startTracking();

    expect(pushFocusUpdate).toHaveBeenLastCalledWith({
      remoteElementId: 'button',
      isFocusVisible: true,
    });

    stopTracking();
    pushFocusUpdate.mockClear();
    input.focus();
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
    );
    input.blur();

    expect(pushFocusUpdate).not.toHaveBeenCalled();
  });
});
