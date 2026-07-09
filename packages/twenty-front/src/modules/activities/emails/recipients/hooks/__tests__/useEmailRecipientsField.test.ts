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

    expect(view.result.current.selectedChipIndex).toBe(1);

    act(() => {
      view.result.current.removeRecipientWithKeyboard();
    });

    expect(onChange).toHaveBeenCalledWith([{ address: 'a@example.com' }]);
    expect(view.result.current.selectedChipIndex).toBe(0);
  });

  it('should clear the selection when moving right past the last chip', () => {
    const { view } = setup([{ address: 'a@example.com' }]);

    act(() => {
      view.result.current.moveChipSelection(-1);
    });
    act(() => {
      view.result.current.moveChipSelection(1);
    });

    expect(view.result.current.selectedChipIndex).toBeNull();
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
