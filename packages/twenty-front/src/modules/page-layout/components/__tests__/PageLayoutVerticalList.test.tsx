import { PageLayoutVerticalList } from '@/page-layout/components/PageLayoutVerticalList';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  type WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

let mockLayoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST;

jest.mock('@/page-layout/contexts/PageLayoutContentContext', () => ({
  usePageLayoutContentContext: () => ({
    layoutMode: mockLayoutMode,
    tabId: 'tab-id',
  }),
}));

jest.mock('@/page-layout/hooks/useIsSideColumnContext', () => ({
  useIsSideColumnContext: () => false,
}));

jest.mock('@/page-layout/widgets/hooks/useIsInPinnedTab', () => ({
  useIsInPinnedTab: () => ({ isInPinnedTab: false }),
}));

jest.mock('@/page-layout/widgets/components/WidgetRenderer', () => ({
  WidgetRenderer: ({ widget }: { widget: PageLayoutWidget }) => (
    <div data-testid={widget.id} />
  ),
}));

jest.mock(
  '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget',
  () => ({
    DragDropItemDropTarget: () => null,
  }),
);

jest.mock(
  '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell',
  () => ({
    DragDropItemSortableCell: ({
      children,
      fill,
      id,
    }: {
      children: ReactNode;
      fill?: boolean;
      id: string;
    }) => (
      <div data-fill={String(fill)} data-testid={`${id}-sortable-cell`}>
        {children}
      </div>
    ),
  }),
);

jest.mock('@dnd-kit/react', () => ({
  useDroppable: () => ({ ref: jest.fn() }),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
}));

const makeWidget = (id: string, type: WidgetType): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget',
  applicationId: 'application-id',
  configuration: {
    configurationType: type as unknown as WidgetConfigurationType,
  } as PageLayoutWidget['configuration'],
  createdAt: '2026-08-19T00:00:00.000Z',
  deletedAt: null,
  gridPosition: {
    column: 0,
    columnSpan: 1,
    row: 0,
    rowSpan: 1,
  },
  id,
  isActive: true,
  isSystemSideEffect: false,
  objectMetadataId: null,
  pageLayoutTabId: 'tab-id',
  title: id,
  type,
  universalIdentifier: `${id}-universal`,
  updatedAt: '2026-08-19T00:00:00.000Z',
});

describe('PageLayoutVerticalList', () => {
  beforeEach(() => {
    mockLayoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST;
  });

  it('gives Timeline FILL_VIEWPORT sizing regardless of its position', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          makeWidget('timeline', WidgetType.TIMELINE),
          makeWidget('fields', WidgetType.FIELDS),
        ]}
      />,
    );

    expect(
      screen
        .getByTestId('timeline')
        .closest('.page-layout-viewport-filling-widget-slot'),
    ).not.toBeNull();
    expect(screen.getByTestId('timeline-sortable-cell')).toHaveAttribute(
      'data-fill',
      'true',
    );
    expect(
      screen
        .getByTestId('fields')
        .closest('.page-layout-viewport-filling-widget-slot'),
    ).toBeNull();
    expect(screen.getByTestId('fields-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
  });

  it('gives FILL_VIEWPORT sizing to other viewport-filling widgets', () => {
    const viewportWidgets = [
      makeWidget('calendar', WidgetType.CALENDAR),
      makeWidget('call-recording-summary', WidgetType.CALL_RECORDING_SUMMARY),
      makeWidget(
        'call-recording-transcript',
        WidgetType.CALL_RECORDING_TRANSCRIPT,
      ),
      makeWidget('emails', WidgetType.EMAILS),
      makeWidget('email-thread', WidgetType.EMAIL_THREAD),
      makeWidget('files', WidgetType.FILES),
      makeWidget('message-campaign-body', WidgetType.MESSAGE_CAMPAIGN_BODY),
      makeWidget('notes', WidgetType.NOTES),
      makeWidget('tasks', WidgetType.TASKS),
      makeWidget('workflow', WidgetType.WORKFLOW),
    ];

    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[makeWidget('fields', WidgetType.FIELDS), ...viewportWidgets]}
      />,
    );

    for (const widget of viewportWidgets) {
      expect(
        screen
          .getByTestId(widget.id)
          .closest('.page-layout-viewport-filling-widget-slot'),
      ).not.toBeNull();
      expect(screen.getByTestId(`${widget.id}-sortable-cell`)).toHaveAttribute(
        'data-fill',
        'true',
      );
    }

    expect(
      screen
        .getByTestId('fields')
        .closest('.page-layout-viewport-filling-widget-slot'),
    ).toBeNull();
  });

  it('gates FILL_VIEWPORT sizing on vertical-list layout mode', () => {
    mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;

    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[makeWidget('timeline', WidgetType.TIMELINE)]}
      />,
    );

    expect(
      screen
        .getByTestId('timeline')
        .closest('.page-layout-viewport-filling-widget-slot'),
    ).toBeNull();
    expect(screen.getByTestId('timeline-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
  });
});
