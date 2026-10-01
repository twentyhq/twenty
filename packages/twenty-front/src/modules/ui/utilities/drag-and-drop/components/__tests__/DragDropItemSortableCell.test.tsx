import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DragDropItemSortableHandle } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableHandle';
import { DragDropProvider } from '@dnd-kit/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const renderContent = (disabled: boolean, withHandle = false) => (
  <DragDropProvider>
    <DragDropItemSortableCell
      id="widget-id"
      index={0}
      group="tab-id"
      disabled={disabled}
    >
      {withHandle && (
        <DragDropItemSortableHandle disabled={disabled}>
          Move widget
        </DragDropItemSortableHandle>
      )}
      <input aria-label="Message" />
      <button type="button">Send</button>
    </DragDropItemSortableCell>
  </DragDropProvider>
);

const getSortableRoot = () => screen.getByRole('textbox').parentElement;

const expectAccessibleContent = () => {
  for (const element of [
    screen.getByRole('textbox', { name: 'Message' }),
    screen.getByRole('button', { name: 'Send' }),
  ]) {
    expect(element.closest('[aria-disabled="true"]')).toBeNull();
  }
  expect(getSortableRoot()).not.toHaveAttribute('role', 'button');
  expect(getSortableRoot()).not.toHaveAttribute('tabindex', '0');
  expect(getSortableRoot()).not.toHaveAttribute('aria-roledescription');
  expect(getSortableRoot()).not.toHaveAttribute('aria-describedby');
};

describe('DragDropItemSortableCell', () => {
  it('keeps inputs and buttons accessible when dragging is disabled', async () => {
    const user = userEvent.setup();
    render(renderContent(true));

    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.keyboard('Hello');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Send' })).toHaveFocus();
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
    expectAccessibleContent();
  });

  it('exposes keyboard drag affordances when dragging is enabled', async () => {
    const user = userEvent.setup();
    render(renderContent(false));

    await waitFor(() => {
      expect(getSortableRoot()).toHaveAttribute('role', 'button');
      expect(getSortableRoot()).toHaveAttribute('tabindex', '0');
      expect(getSortableRoot()).toHaveAttribute('aria-disabled', 'false');
    });
    await user.tab();
    expect(getSortableRoot()).toHaveFocus();
  });

  it('preserves the editor when dragging is repeatedly enabled and disabled', async () => {
    const user = userEvent.setup();
    const { rerender } = render(renderContent(true));
    const editor = screen.getByRole('textbox');
    await user.tab();
    await user.keyboard('Unsaved message');

    for (let transition = 0; transition < 2; transition++) {
      rerender(renderContent(false));
      await waitFor(() => {
        expect(getSortableRoot()).toHaveAttribute('role', 'button');
        expect(getSortableRoot()).toHaveAttribute('aria-disabled', 'false');
      });
      rerender(renderContent(true));
      await user.tab();
      expectAccessibleContent();
      expect(screen.getByRole('textbox')).toBe(editor);
      expect(editor).toHaveValue('Unsaved message');
    }
  });

  it('keeps disabled state on an explicit handle away from the editor', async () => {
    const user = userEvent.setup();
    const { rerender } = render(renderContent(false, true));
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move widget' }),
      ).toHaveAttribute('aria-disabled', 'false');
    });
    rerender(renderContent(true, true));
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move widget' }),
      ).toHaveAttribute('aria-disabled', 'true');
    });
    await user.type(screen.getByRole('textbox'), 'Hello');
    expectAccessibleContent();
  });
});
