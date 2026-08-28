import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

let mockIsInEditMode = false;
const mockNavigateToMoreWidgets = jest.fn();

jest.mock('@/page-layout/hooks/useNavigateToMoreWidgets', () => ({
  useNavigateToMoreWidgets: () => ({
    navigateToMoreWidgets: mockNavigateToMoreWidgets,
  }),
}));

const mockWidget = {
  __typename: 'PageLayoutWidget',
  applicationId: 'application-id',
  configuration: {
    __typename: 'FieldsConfiguration',
    configurationType: WidgetConfigurationType.FIELDS,
    viewId: null,
  },
  createdAt: '2026-08-19T00:00:00.000Z',
  deletedAt: null,
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    __typename: 'PageLayoutWidgetGridPosition',
    column: 0,
    columnSpan: 1,
    row: 0,
    rowSpan: 1,
  },
  id: 'widget-id',
  isActive: true,
  isSystemSideEffect: false,
  objectMetadataId: null,
  pageLayoutTabId: 'tab-id',
  title: 'Fields',
  type: WidgetType.FIELDS,
  universalIdentifier: 'widget-universal-id',
  updatedAt: '2026-08-19T00:00:00.000Z',
} satisfies PageLayoutWidget;

const mockTab = makeTab(
  'tab-id',
  [mockWidget],
  0,
  PageLayoutTabLayoutMode.VERTICAL_LIST,
);

jest.mock('@/page-layout/contexts/PageLayoutContentContext', () => ({
  usePageLayoutContentContext: () => ({
    layoutMode: 'VERTICAL_LIST',
    tabId: 'tab-id',
  }),
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayoutOrThrow', () => ({
  useCurrentPageLayoutOrThrow: () => ({
    currentPageLayout: {
      type: 'RECORD_PAGE',
    },
  }),
}));

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => mockIsInEditMode,
}));

jest.mock(
  '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow',
  () => ({
    usePageLayoutTabWithVisibleWidgetsOrThrow: () => mockTab,
  }),
);

jest.mock('@/page-layout/hooks/useIsSideColumnContext', () => ({
  useIsSideColumnContext: () => false,
}));

jest.mock('@/page-layout/widgets/hooks/useIsInPinnedTab', () => ({
  useIsInPinnedTab: () => ({ isInPinnedTab: false }),
}));

jest.mock('@/page-layout/widgets/components/WidgetRenderer', () => {
  const { useState } = jest.requireActual('react') as typeof React;

  return {
    WidgetRenderer: ({ widget }: { widget: PageLayoutWidget }) => {
      const [isExpanded, setIsExpanded] = useState(false);

      return (
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-label={widget.title}
          onClick={() => setIsExpanded((current: boolean) => !current)}
        >
          Toggle widget expansion
        </button>
      );
    },
  };
});

jest.mock(
  '@/page-layout/widgets/components/RecordPageAddWidgetSection',
  () => ({
    RecordPageAddWidgetSection: () => <div>Add widget</div>,
  }),
);

jest.mock(
  '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget',
  () => ({
    DragDropItemDropTarget: () => null,
  }),
);

jest.mock(
  '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell',
  () => ({
    DragDropItemSortableCell: ({ children }: { children: React.ReactNode }) =>
      children,
  }),
);

jest.mock('@dnd-kit/react', () => ({
  useDroppable: () => ({ ref: jest.fn() }),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
}));

describe('PageLayoutContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInEditMode = false;
    mockTab.widgets = [mockWidget];
  });

  it('keeps widget-local state when edit mode changes', async () => {
    const { rerender } = render(<PageLayoutContent />);
    const expansionButton = screen.getByRole('button', {
      name: 'Fields',
    });

    await userEvent.setup().click(expansionButton);

    expect(expansionButton).toHaveAttribute('aria-expanded', 'true');

    mockIsInEditMode = true;
    rerender(<PageLayoutContent />);

    expect(screen.getByRole('button', { name: 'Fields' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Add widget')).toBeInTheDocument();
  });

  it('keeps the expanded chooser after the last fit-content widget', () => {
    mockIsInEditMode = true;
    render(<PageLayoutContent />);
    const addWidget = screen.getByText('Add widget');
    expect(
      screen
        .getByRole('button', { name: 'Fields' })
        .compareDocumentPosition(addWidget) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it.each([
    WidgetType.TASKS,
    WidgetType.TIMELINE,
    WidgetType.FILES,
    WidgetType.EMAILS,
    WidgetType.NOTES,
    WidgetType.CALENDAR,
    WidgetType.WORKFLOW,
    WidgetType.CALL_RECORDING_SUMMARY,
  ])('hides the expanded chooser when a %s widget fills the tab', (type) => {
    mockIsInEditMode = true;
    mockTab.widgets.push({
      ...mockWidget,
      id: 'full-height',
      title: 'Full-height widget',
      type,
    });

    render(<PageLayoutContent />);

    expect(screen.queryByText('Add widget')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Add widget above Full-height widget',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /^Add widget above / }),
    ).toHaveLength(2);
  });

  it('opens the picker at the gap before a full-height widget', async () => {
    mockIsInEditMode = true;
    mockTab.widgets.push({
      ...mockWidget,
      id: 'tasks',
      title: 'Tasks',
      type: WidgetType.TASKS,
    });
    render(<PageLayoutContent />);

    const insertionButton = screen.getByRole('button', {
      name: 'Add widget above Tasks',
    });
    expect(
      screen
        .getByRole('button', { name: 'Fields' })
        .compareDocumentPosition(insertionButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      insertionButton.compareDocumentPosition(
        screen.getByRole('button', { name: 'Tasks' }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await userEvent.setup().click(insertionButton);
    expect(mockNavigateToMoreWidgets).toHaveBeenCalledWith({
      targetWidgetId: 'tasks',
      direction: 'above',
    });
  });

  it('keeps an insertion point above a lone full-height widget', () => {
    mockIsInEditMode = true;
    mockTab.widgets = [
      { ...mockWidget, id: 'tasks', title: 'Tasks', type: WidgetType.TASKS },
    ];

    render(<PageLayoutContent />);
    expect(
      screen.getByRole('button', { name: 'Add widget above Tasks' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Add widget')).not.toBeInTheDocument();
  });

  it('opens an insertion point with the keyboard', async () => {
    mockIsInEditMode = true;
    render(<PageLayoutContent />);
    const user = userEvent.setup();
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Add widget above Fields' }),
    ).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(mockNavigateToMoreWidgets).toHaveBeenCalledWith({
      targetWidgetId: 'widget-id',
      direction: 'above',
    });
  });

  it('removes insertion controls when leaving edit mode', () => {
    mockIsInEditMode = true;
    const { rerender } = render(<PageLayoutContent />);
    expect(
      screen.getByRole('button', { name: 'Add widget above Fields' }),
    ).toBeInTheDocument();
    mockIsInEditMode = false;
    rerender(<PageLayoutContent />);
    expect(
      screen.queryByRole('button', { name: /^Add widget above / }),
    ).not.toBeInTheDocument();
  });

  it('keeps the expanded chooser on empty tabs', () => {
    mockIsInEditMode = true;
    mockTab.widgets = [];
    render(<PageLayoutContent />);
    expect(screen.getByText('Add widget')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Add widget above / }),
    ).not.toBeInTheDocument();
  });

  it('hides the insertion row outside edit mode', () => {
    render(<PageLayoutContent />);
    expect(screen.queryByText('Add widget')).not.toBeInTheDocument();
  });
});
