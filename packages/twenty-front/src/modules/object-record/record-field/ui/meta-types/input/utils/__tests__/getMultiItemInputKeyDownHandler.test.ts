import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { type KeyboardEvent } from 'react';

const buildKeyDownEvent = ({
  key,
  shiftKey = false,
  metaKey = false,
  isComposing = false,
}: {
  key: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  isComposing?: boolean;
}) =>
  ({
    key,
    shiftKey,
    metaKey,
    altKey: false,
    ctrlKey: false,
    nativeEvent: { isComposing, keyCode: 0 },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  }) as unknown as KeyboardEvent<HTMLInputElement>;

describe('getMultiItemInputKeyDownHandler', () => {
  it('calls onEnter on Enter and stops the event', () => {
    const onEnter = jest.fn();
    const event = buildKeyDownEvent({ key: 'Enter' });

    getMultiItemInputKeyDownHandler({ onEnter })(event);

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('routes Tab and Shift+Tab to their handlers', () => {
    const onTab = jest.fn();
    const onShiftTab = jest.fn();
    const handleKeyDown = getMultiItemInputKeyDownHandler({
      onTab,
      onShiftTab,
    });

    handleKeyDown(buildKeyDownEvent({ key: 'Tab' }));
    handleKeyDown(buildKeyDownEvent({ key: 'Tab', shiftKey: true }));

    expect(onTab).toHaveBeenCalledTimes(1);
    expect(onShiftTab).toHaveBeenCalledTimes(1);
  });

  it('prevents the default Tab navigation when asked, even without a handler', () => {
    const event = buildKeyDownEvent({ key: 'Tab' });

    getMultiItemInputKeyDownHandler({ preventTabNavigation: true })(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it('ignores composing input and modifier combinations', () => {
    const onEnter = jest.fn();
    const handleKeyDown = getMultiItemInputKeyDownHandler({ onEnter });

    handleKeyDown(buildKeyDownEvent({ key: 'Enter', isComposing: true }));
    handleKeyDown(buildKeyDownEvent({ key: 'Enter', metaKey: true }));

    expect(onEnter).not.toHaveBeenCalled();
  });
});
