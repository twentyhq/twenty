import { act, renderHook } from '@testing-library/react';

import { useEmailRecipientsField } from '@/activities/emails/recipients/hooks/useEmailRecipientsField';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

const setup = (initialRecipients: EmailRecipient[] = []) => {
  const onChange = jest.fn();

  const view = renderHook(
    ({ recipients }: { recipients: EmailRecipient[] }) =>
      useEmailRecipientsField({ recipients, onChange }),
    { initialProps: { recipients: initialRecipients } },
  );

  return { view, onChange };
};

describe('useEmailRecipientsField', () => {
  it('should commit typed input as parsed recipients', () => {
    const { view, onChange } = setup();

    act(() => {
      view.result.current.setInputValue('Jane Doe <jane@example.com>');
    });
    act(() => {
      view.result.current.commitInput();
    });

    expect(onChange).toHaveBeenCalledWith([
      { address: 'jane@example.com', displayName: 'Jane Doe' },
    ]);
    expect(view.result.current.inputValue).toBe('');
  });

  it('should not call onChange when committing an empty buffer', () => {
    const { view, onChange } = setup();

    act(() => {
      view.result.current.commitInput();
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should flash the existing chip instead of adding a duplicate', () => {
    const { view, onChange } = setup([{ address: 'jane@example.com' }]);

    act(() => {
      view.result.current.setInputValue('JANE@example.com');
    });
    act(() => {
      view.result.current.commitInput();
    });

    expect(onChange).toHaveBeenCalledWith([{ address: 'jane@example.com' }]);
    expect(view.result.current.chipFlash?.chipKey).toBe('jane@example.com');
  });

  it('should replace the edited chip on commit', () => {
    const { view, onChange } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
    ]);

    act(() => {
      view.result.current.beginEditingChip(0);
    });

    expect(view.result.current.inputValue).toBe('a@example.com');

    act(() => {
      view.result.current.setInputValue('c@example.com');
    });
    act(() => {
      view.result.current.commitInput();
    });

    expect(onChange).toHaveBeenCalledWith([
      { address: 'c@example.com', displayName: undefined },
      { address: 'b@example.com' },
    ]);
    expect(view.result.current.editingIndex).toBeNull();
  });

  it('should remove the edited chip when committed empty', () => {
    const { view, onChange } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
    ]);

    act(() => {
      view.result.current.beginEditingChip(0);
    });
    act(() => {
      view.result.current.setInputValue('   ');
    });
    act(() => {
      view.result.current.commitInput();
    });

    expect(onChange).toHaveBeenCalledWith([{ address: 'b@example.com' }]);
  });

  it('should restore the chip untouched when editing is cancelled', () => {
    const { view, onChange } = setup([{ address: 'a@example.com' }]);

    act(() => {
      view.result.current.beginEditingChip(0);
    });
    act(() => {
      view.result.current.setInputValue('changed@example.com');
    });
    act(() => {
      view.result.current.cancelEditing();
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(view.result.current.editingIndex).toBeNull();
    expect(view.result.current.inputValue).toBe('');
  });

  it('should select the last chip and keep selection on the previous chip after keyboard removal', () => {
    const { view, onChange } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
    ]);

    act(() => {
      view.result.current.moveChipSelection(-1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([1]);

    act(() => {
      view.result.current.removeSelectedRecipients();
    });

    expect(onChange).toHaveBeenCalledWith([{ address: 'a@example.com' }]);
    expect(view.result.current.selectedChipIndices).toEqual([0]);
  });

  it('should clear the selection when moving right past the last chip', () => {
    const { view } = setup([{ address: 'a@example.com' }]);

    act(() => {
      view.result.current.moveChipSelection(-1);
    });
    act(() => {
      view.result.current.moveChipSelection(1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([]);
    expect(view.result.current.selectionFocusIndex).toBeNull();
  });

  it('should extend the selection leftwards with shift+arrow', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);

    act(() => {
      view.result.current.extendChipSelection(-1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([2]);

    act(() => {
      view.result.current.extendChipSelection(-1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([1, 2]);

    act(() => {
      view.result.current.extendChipSelection(-1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([0, 1, 2]);
  });

  it('should shrink the extended selection when reversing direction', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);

    act(() => {
      view.result.current.extendChipSelection(-1);
    });
    act(() => {
      view.result.current.extendChipSelection(-1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([1, 2]);

    act(() => {
      view.result.current.extendChipSelection(1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([2]);
  });

  it('should keep the selection when extending past the last chip', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
    ]);

    act(() => {
      view.result.current.extendChipSelection(-1);
    });
    act(() => {
      view.result.current.extendChipSelection(1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([1]);
  });

  it('should select a range when shift clicking away from the anchor', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
      { address: 'd@example.com' },
    ]);

    act(() => {
      view.result.current.selectChipAtIndex(1);
    });
    act(() => {
      view.result.current.extendChipSelectionToIndex(3);
    });

    expect(view.result.current.selectedChipIndices).toEqual([1, 2, 3]);
  });

  it('should select a backwards range when shift clicking before the anchor', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);

    act(() => {
      view.result.current.selectChipAtIndex(2);
    });
    act(() => {
      view.result.current.extendChipSelectionToIndex(0);
    });

    expect(view.result.current.selectedChipIndices).toEqual([0, 1, 2]);
  });

  it('should add and remove single chips when toggling the selection', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);

    act(() => {
      view.result.current.selectChipAtIndex(0);
    });
    act(() => {
      view.result.current.toggleChipSelectionAtIndex(2);
    });

    expect(view.result.current.selectedChipIndices).toEqual([0, 2]);

    act(() => {
      view.result.current.toggleChipSelectionAtIndex(0);
    });

    expect(view.result.current.selectedChipIndices).toEqual([2]);
  });

  it('should move the cursor off a chip that was toggled out of the selection', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);

    act(() => {
      view.result.current.selectChipAtIndex(1);
    });
    act(() => {
      view.result.current.extendChipSelectionToIndex(2);
    });

    expect(view.result.current.selectionFocusIndex).toBe(2);

    act(() => {
      view.result.current.toggleChipSelectionAtIndex(2);
    });

    expect(view.result.current.selectedChipIndices).toEqual([1]);
    expect(view.result.current.selectionFocusIndex).toBe(1);
  });

  it('should remove every selected chip at once', () => {
    const { view, onChange } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
      { address: 'd@example.com' },
    ]);

    act(() => {
      view.result.current.selectChipAtIndex(1);
    });
    act(() => {
      view.result.current.extendChipSelectionToIndex(2);
    });
    act(() => {
      view.result.current.removeSelectedRecipients();
    });

    expect(onChange).toHaveBeenCalledWith([
      { address: 'a@example.com' },
      { address: 'd@example.com' },
    ]);
    expect(view.result.current.selectedChipIndices).toEqual([0]);
  });

  it('should keep the selection on the same recipients after a reorder', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);

    act(() => {
      view.result.current.selectChipAtIndex(0);
    });
    act(() => {
      view.result.current.extendChipSelectionToIndex(1);
    });

    expect(view.result.current.selectedChipIndices).toEqual([0, 1]);

    // A drag moved a@example.com to the end; the selection has to follow the
    // addresses rather than staying on positions 0 and 1.
    view.rerender({
      recipients: [
        { address: 'b@example.com' },
        { address: 'c@example.com' },
        { address: 'a@example.com' },
      ],
    });

    expect(view.result.current.selectedChipIndices).toEqual([0, 2]);
  });

  it('should remove the originally selected recipients after a reorder', () => {
    const { view, onChange } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);

    act(() => {
      view.result.current.selectChipAtIndex(0);
    });

    view.rerender({
      recipients: [
        { address: 'b@example.com' },
        { address: 'c@example.com' },
        { address: 'a@example.com' },
      ],
    });

    act(() => {
      view.result.current.removeSelectedRecipients();
    });

    expect(onChange).toHaveBeenCalledWith([
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);
  });

  it('should drop selected indices that no longer exist after recipients shrink', () => {
    const { view } = setup([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
      { address: 'c@example.com' },
    ]);

    act(() => {
      view.result.current.selectChipAtIndex(0);
    });
    act(() => {
      view.result.current.extendChipSelectionToIndex(2);
    });

    expect(view.result.current.selectedChipIndices).toEqual([0, 1, 2]);

    view.rerender({ recipients: [{ address: 'a@example.com' }] });

    expect(view.result.current.selectedChipIndices).toEqual([0]);
  });

  it('should add a picked suggestion as a recipient', () => {
    const { view, onChange } = setup([{ address: 'a@example.com' }]);

    act(() => {
      view.result.current.addRecipient({
        address: 'jane@example.com',
        displayName: 'Jane Doe',
      });
    });

    expect(onChange).toHaveBeenCalledWith([
      { address: 'a@example.com' },
      { address: 'jane@example.com', displayName: 'Jane Doe' },
    ]);
    expect(view.result.current.inputValue).toBe('');
  });
});
