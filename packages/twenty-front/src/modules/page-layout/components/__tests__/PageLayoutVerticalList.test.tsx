import { PageLayoutVerticalList } from '@/page-layout/components/PageLayoutVerticalList';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WorkflowDiagramAllowPageScrollContext } from '@/workflow/workflow-diagram/contexts/WorkflowDiagramAllowPageScrollContext';
import { render, screen } from '@testing-library/react';
import { type ReactNode, useContext } from 'react';
import {
  PageLayoutTabLayoutMode,
  type WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

let mockLayoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST;
let mockIsSideColumnContext = false;
let mockIsInPinnedTab = false;

jest.mock('@/page-layout/contexts/PageLayoutContentContext', () => ({
  usePageLayoutContentContext: () => ({
    layoutMode: mockLayoutMode,
    tabId: 'tab-id',
  }),
}));

jest.mock('@/page-layout/hooks/useIsSideColumnContext', () => ({
  useIsSideColumnContext: () => mockIsSideColumnContext,
}));

jest.mock('@/page-layout/widgets/hooks/useIsInPinnedTab', () => ({
  useIsInPinnedTab: () => ({ isInPinnedTab: mockIsInPinnedTab }),
}));

jest.mock('@/page-layout/widgets/components/WidgetRenderer', () => ({
  WidgetRenderer: ({ widget }: { widget: PageLayoutWidget }) => {
    const allowPageScroll = useContext(WorkflowDiagramAllowPageScrollContext);

    return (
      <div
        data-allow-page-scroll={String(allowPageScroll)}
        data-testid={widget.id}
      />
    );
  },
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
    mockIsSideColumnContext = false;
    mockIsInPinnedTab = false;
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

  it('gives a lone Canvas front component viewport-filling sizing', () => {
    mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;

    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[makeWidget('front-component', WidgetType.FRONT_COMPONENT)]}
      />,
    );

    expect(
      screen
        .getByTestId('front-component')
        .closest('.page-layout-viewport-filling-widget-slot'),
    ).not.toBeNull();
    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'true',
    );
  });

  it('keeps multiple Canvas widgets fit-content', () => {
    mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;

    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          makeWidget('front-component', WidgetType.FRONT_COMPONENT),
          makeWidget('fields', WidgetType.FIELDS),
        ]}
      />,
    );

    expect(
      screen
        .getByTestId('front-component')
        .closest('.page-layout-viewport-filling-widget-slot'),
    ).toBeNull();
    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
    expect(screen.getByTestId('fields-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
  });

  it('keeps a lone Canvas widget fit-content in edit mode', () => {
    mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;

    render(
      <PageLayoutVerticalList
        isInEditMode
        widgets={[makeWidget('front-component', WidgetType.FRONT_COMPONENT)]}
      />,
    );

    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
  });

  it('keeps a lone Canvas front component viewport-filling in a side panel', () => {
    mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;
    mockIsSideColumnContext = true;

    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[makeWidget('front-component', WidgetType.FRONT_COMPONENT)]}
      />,
    );

    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'true',
    );
  });

  it('keeps a lone Canvas widget fit-content in a pinned tab', () => {
    mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;
    mockIsInPinnedTab = true;

    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[makeWidget('front-component', WidgetType.FRONT_COMPONENT)]}
      />,
    );

    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
  });

  it('keeps front components fit-content in vertical lists', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[makeWidget('front-component', WidgetType.FRONT_COMPONENT)]}
      />,
    );

    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
  });

  it('keeps the wheel on a workflow canvas that is alone in its tab', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[makeWidget('workflow', WidgetType.WORKFLOW)]}
      />,
    );

    expect(screen.getByTestId('workflow')).toHaveAttribute(
      'data-allow-page-scroll',
      'false',
    );
  });

  it('lets the page scroll over a workflow canvas that shares its tab', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          makeWidget('fields', WidgetType.FIELDS),
          makeWidget('workflow', WidgetType.WORKFLOW),
        ]}
      />,
    );

    expect(screen.getByTestId('workflow')).toHaveAttribute(
      'data-allow-page-scroll',
      'true',
    );
  });

  it('never allows page scroll for a fit-content widget', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          makeWidget('fields', WidgetType.FIELDS),
          makeWidget('workflow', WidgetType.WORKFLOW),
        ]}
      />,
    );

    expect(screen.getByTestId('fields')).toHaveAttribute(
      'data-allow-page-scroll',
      'false',
    );
  });
});
