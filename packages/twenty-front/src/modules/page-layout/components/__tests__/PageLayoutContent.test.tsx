import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { fireEvent, render, screen } from '@testing-library/react';
import type * as React from 'react';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

let mockIsInEditMode = false;

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
  gridPosition: {
    __typename: 'GridPosition',
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
    WidgetRenderer: () => {
      const [isExpanded, setIsExpanded] = useState(false);

      return (
        <button
          type="button"
          aria-expanded={isExpanded}
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
    mockIsInEditMode = false;
  });

  it('keeps widget-local state when edit mode changes', () => {
    const { rerender } = render(<PageLayoutContent />);
    const expansionButton = screen.getByRole('button', {
      name: 'Toggle widget expansion',
    });

    fireEvent.click(expansionButton);

    expect(expansionButton).toHaveAttribute('aria-expanded', 'true');

    mockIsInEditMode = true;
    rerender(<PageLayoutContent />);

    expect(
      screen.getByRole('button', { name: 'Toggle widget expansion' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Add widget')).toBeInTheDocument();
  });
});
