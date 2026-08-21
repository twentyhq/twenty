import { render, screen } from '@testing-library/react';

import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { ViewType } from '~/generated-metadata/graphql';

const mockUseViewById = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: jest.fn(() => ({
    objectMetadataItem: { nameSingular: 'company' },
  })),
}));
jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: jest.fn(() => false),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue',
  () => ({ useAtomComponentFamilySelectorValue: jest.fn(() => undefined) }),
);
jest.mock('@/views/hooks/useViewById', () => ({
  useViewById: () => mockUseViewById(),
}));
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(() => false),
}));
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidgetProvider',
  () => ({
    RecordTableWidgetProvider: ({ children }: { children: React.ReactNode }) =>
      children,
  }),
);
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidget',
  () => ({ RecordTableWidget: () => <div>record table widget</div> }),
);
jest.mock(
  '@/object-record/record-board-widget/components/RecordBoardWidget',
  () => ({ RecordBoardWidget: () => <div>record board widget</div> }),
);
jest.mock(
  '@/object-record/record-list-widget/components/RecordListWidget',
  () => ({
    RecordListWidget: () => <div>record list widget</div>,
  }),
);
jest.mock(
  '@/object-record/record-calendar-widget/components/RecordCalendarWidget',
  () => ({ RecordCalendarWidget: () => <div>record calendar widget</div> }),
);

const renderWidgetForViewType = (viewType: ViewType | undefined) => {
  mockUseViewById.mockReturnValue({
    view:
      viewType === undefined ? undefined : { id: 'view-id', type: viewType },
  });

  render(
    <RecordTableWidgetRendererContent
      objectMetadataId="object-metadata-id"
      viewId="view-id"
      widgetId="widget-id"
    />,
  );
};

describe('RecordTableWidgetRendererContent', () => {
  beforeEach(() => jest.clearAllMocks());

  // A layout that fell through to the table renderer was the bug this widget
  // type set out to fix, so every layout has to claim its own renderer.
  it.each([
    [ViewType.TABLE_WIDGET, 'record table widget'],
    [ViewType.KANBAN_WIDGET, 'record board widget'],
    [ViewType.LIST_WIDGET, 'record list widget'],
    [ViewType.CALENDAR_WIDGET, 'record calendar widget'],
  ])('should render %s with its own widget', (viewType, expectedWidget) => {
    renderWidgetForViewType(viewType);

    expect(screen.getByText(expectedWidget)).toBeVisible();
  });

  // A widget can be backed by a plain view, which keeps that view's layout.
  it('should render a non-widget list view as a list', () => {
    renderWidgetForViewType(ViewType.LIST);

    expect(screen.getByText('record list widget')).toBeVisible();
  });

  it('should render a widget with no view as a table', () => {
    renderWidgetForViewType(undefined);

    expect(screen.getByText('record table widget')).toBeVisible();
  });
});
