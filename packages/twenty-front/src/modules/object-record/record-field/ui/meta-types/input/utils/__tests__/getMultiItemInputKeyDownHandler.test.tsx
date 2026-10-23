import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { fireEvent, render, screen } from '@testing-library/react';

const renderInput = (
  handlers: Parameters<typeof getMultiItemInputKeyDownHandler>[0],
  onParentKeyDown = jest.fn(),
) => {
  render(
    <div onKeyDown={onParentKeyDown}>
      <input
        aria-label="value"
        onKeyDown={getMultiItemInputKeyDownHandler(handlers)}
      />
    </div>,
  );

  return { input: screen.getByLabelText('value'), onParentKeyDown };
};

describe('getMultiItemInputKeyDownHandler', () => {
  it('calls onEnter on Enter and stops the event', () => {
    const onEnter = jest.fn();
    const { input, onParentKeyDown } = renderInput({ onEnter });

    const isDefaultAllowed = fireEvent.keyDown(input, { key: 'Enter' });

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(isDefaultAllowed).toBe(false);
    expect(onParentKeyDown).not.toHaveBeenCalled();
  });

  it('routes Tab and Shift+Tab to their handlers', () => {
    const onTab = jest.fn();
    const onShiftTab = jest.fn();
    const { input } = renderInput({ onTab, onShiftTab });

    fireEvent.keyDown(input, { key: 'Tab' });
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });

    expect(onTab).toHaveBeenCalledTimes(1);
    expect(onShiftTab).toHaveBeenCalledTimes(1);
  });

  it('prevents the default Tab navigation when asked, even without a handler', () => {
    const { input, onParentKeyDown } = renderInput({
      preventTabNavigation: true,
    });

    const isDefaultAllowed = fireEvent.keyDown(input, { key: 'Tab' });

    expect(isDefaultAllowed).toBe(false);
    expect(onParentKeyDown).toHaveBeenCalledTimes(1);
  });

  it('ignores composing input and modifier combinations', () => {
    const onEnter = jest.fn();
    const { input } = renderInput({ onEnter });

    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });

    expect(onEnter).not.toHaveBeenCalled();
  });
});
