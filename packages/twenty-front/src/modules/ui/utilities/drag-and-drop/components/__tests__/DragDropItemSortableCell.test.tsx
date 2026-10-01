import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DragDropItemSortableHandle } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableHandle';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';
import { type DragDropEvents, DragDropProvider } from '@dnd-kit/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';

const TabHandle = ({ disabled }: { disabled: boolean }) => {
  const handleRef = useContext(DragDropItemSortableHandleRefContext);

  return (
    <button
      ref={handleRef}
      type="button"
      role="tab"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
    >
      Overview
    </button>
  );
};

const renderTab = (disabled: boolean) => (
  <DragDropProvider>
    <DragDropItemSortableCell
      id="tab-id"
      index={0}
      group="tab-list"
      disabled={disabled}
    >
      <TabHandle disabled={disabled} />
    </DragDropItemSortableCell>
  </DragDropProvider>
);

const expectOwnTabSemantics = (disabled: boolean) => {
  const tab = screen.getByRole('tab', { name: 'Overview' });
  expect(tab).toHaveAttribute('tabindex', '-1');
  if (disabled) {
    expect(tab).toHaveAttribute('aria-disabled', 'true');
  } else {
    expect(tab).not.toHaveAttribute('aria-disabled', 'true');
  }
  return tab;
};

const renderContent = ({
  disabled,
  withHandle = false,
  onBeforeDragStart,
}: {
  disabled: boolean;
  withHandle?: boolean;
  onBeforeDragStart?: DragDropEvents['beforedragstart'];
}) => (
  <DragDropProvider onBeforeDragStart={onBeforeDragStart}>
    <DragDropItemSortableCell
      id="widget-id"
      index={0}
      group="tab-id"
      disabled={disabled}
    >
      {withHandle && (
        <DragDropItemSortableHandle disabled={disabled}>
          Widget title
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
  // jsdom lacks the Web Animations API that dnd-kit's keyboard sensor queries
  // before activating a drag.
  beforeAll(() => {
    for (const target of [document, Element.prototype]) {
      Object.defineProperty(target, 'getAnimations', {
        configurable: true,
        value: () => [],
      });
    }
  });

  afterAll(() => {
    for (const target of [document, Element.prototype]) {
      Reflect.deleteProperty(target, 'getAnimations');
    }
  });

  it('keeps inputs and buttons accessible when dragging is disabled', async () => {
    const user = userEvent.setup();
    render(renderContent({ disabled: true }));

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
    render(renderContent({ disabled: false }));

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
    const { rerender } = render(renderContent({ disabled: true }));
    const editor = screen.getByRole('textbox');
    await user.tab();
    await user.keyboard('Unsaved message');

    for (let transition = 0; transition < 2; transition++) {
      rerender(renderContent({ disabled: false }));
      await waitFor(() => {
        expect(getSortableRoot()).toHaveAttribute('role', 'button');
        expect(getSortableRoot()).toHaveAttribute('aria-disabled', 'false');
      });
      rerender(renderContent({ disabled: true }));
      await user.tab();
      expectAccessibleContent();
      expect(screen.getByRole('textbox')).toBe(editor);
      expect(editor).toHaveValue('Unsaved message');
    }
  });

  it('starts a keyboard drag after dragging is enabled again', async () => {
    const user = userEvent.setup();
    const handleDragActivation = jest.fn();
    // Cancelling right after activation keeps the drag out of jsdom's missing
    // layout observers.
    const onBeforeDragStart: DragDropEvents['beforedragstart'] = (event) => {
      handleDragActivation();
      event.preventDefault();
    };
    const { rerender } = render(
      renderContent({ disabled: true, onBeforeDragStart }),
    );

    rerender(renderContent({ disabled: false, onBeforeDragStart }));
    await waitFor(() => {
      expect(getSortableRoot()).toHaveAttribute('tabindex', '0');
    });
    await user.tab();
    expect(getSortableRoot()).toHaveFocus();
    await user.keyboard(' ');

    await waitFor(() => {
      expect(handleDragActivation).toHaveBeenCalledTimes(1);
    });
  });

  it('removes drag affordances from an explicit handle when dragging is disabled', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      renderContent({ disabled: false, withHandle: true }),
    );
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Widget title' }),
      ).toHaveAttribute('aria-disabled', 'false');
    });
    expect(getSortableRoot()).not.toHaveAttribute('role', 'button');

    rerender(renderContent({ disabled: true, withHandle: true }));
    await user.tab();

    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Widget title' })).toBeNull();
    expect(screen.getByText('Widget title')).not.toHaveAttribute(
      'aria-disabled',
    );
    expectAccessibleContent();
  });

  it('keeps the semantics a handle renders itself when dragging is disabled', async () => {
    const { rerender } = render(renderTab(true));
    expect(expectOwnTabSemantics(true)).not.toHaveAttribute(
      'aria-roledescription',
    );

    rerender(renderTab(false));
    await waitFor(() => {
      expect(expectOwnTabSemantics(false)).toHaveAttribute(
        'aria-roledescription',
        'draggable',
      );
    });

    rerender(renderTab(true));
    await waitFor(() => {
      expect(expectOwnTabSemantics(true)).not.toHaveAttribute(
        'aria-roledescription',
      );
    });
    const tab = screen.getByRole('tab', { name: 'Overview' });
    expect(tab).not.toHaveAttribute('aria-describedby');
    expect(tab).not.toHaveAttribute('aria-pressed');
  });
});
