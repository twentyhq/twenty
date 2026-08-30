import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DragDropProvider } from '@dnd-kit/react';
import { render, screen, waitFor } from '@testing-library/react';

// Playwright resolves a click on a non-interactive element to its closest
// button-like ancestor before deciding whether the click target is enabled,
// so a sortable wrapper that advertises itself as a disabled button makes
// every element inside it unclickable for automation.
const CLICK_TARGET_ANCESTOR_SELECTOR =
  'button, [role=button], [role=checkbox], [role=radio]';

const renderSortableCell = ({ disabled }: { disabled: boolean }) =>
  render(
    <DragDropProvider>
      <DragDropItemSortableCell
        id="widget-id"
        index={0}
        group="tab-id"
        disabled={disabled}
      >
        <div data-testid="widget-content">Emails</div>
      </DragDropItemSortableCell>
    </DragDropProvider>,
  );

const getSortableRoot = () =>
  screen.getByTestId('widget-content').parentElement;

describe('DragDropItemSortableCell', () => {
  it('keeps content clickable when dragging is disabled', async () => {
    renderSortableCell({ disabled: true });

    await waitFor(() => {
      expect(getSortableRoot()).toHaveAttribute('aria-disabled', 'true');
    });

    expect(
      screen
        .getByTestId('widget-content')
        .closest(CLICK_TARGET_ANCESTOR_SELECTOR),
    ).toBeNull();
    expect(getSortableRoot()).not.toHaveAttribute('tabindex', '0');
  });

  it('exposes the sortable root as a button when dragging is enabled', async () => {
    renderSortableCell({ disabled: false });

    await waitFor(() => {
      expect(getSortableRoot()).toHaveAttribute('role', 'button');
    });
  });

  it('restores the drag affordances when dragging is enabled again', async () => {
    const { rerender } = renderSortableCell({ disabled: true });

    await waitFor(() => {
      expect(getSortableRoot()).toHaveAttribute('aria-disabled', 'true');
    });

    rerender(
      <DragDropProvider>
        <DragDropItemSortableCell
          id="widget-id"
          index={0}
          group="tab-id"
          disabled={false}
        >
          <div data-testid="widget-content">Emails</div>
        </DragDropItemSortableCell>
      </DragDropProvider>,
    );

    await waitFor(() => {
      expect(getSortableRoot()).toHaveAttribute('role', 'button');
    });
    expect(getSortableRoot()).toHaveAttribute('tabindex', '0');
    expect(getSortableRoot()).toHaveAttribute('aria-disabled', 'false');
  });
});
