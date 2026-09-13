import { PageLayoutVerticalList } from '@/page-layout/components/PageLayoutVerticalList';
import { makeWidget as makePageLayoutWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WorkflowDiagramAllowPageScrollContext } from '@/workflow/workflow-diagram/contexts/WorkflowDiagramAllowPageScrollContext';
import { render, screen } from '@testing-library/react';
import { type ReactNode, useContext } from 'react';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
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
  useIsSideColumnContext: () => ({
    isInPinnedTab: mockIsInPinnedTab,
    isMobile: false,
    isSideColumnContext: mockIsSideColumnContext,
  }),
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

const makeWidget = (id: string, type: WidgetType): PageLayoutWidget => ({
  ...makePageLayoutWidget(id, 0, 'tab-id'),
  type,
});

const makeTabViewportWidget = (
  id: string,
  type: WidgetType,
): PageLayoutWidget => ({
  ...makeWidget(id, type),
  position: {
    __typename: 'PageLayoutWidgetVerticalListPosition',
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 0,
    heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
  },
});

describe('PageLayoutVerticalList', () => {
  beforeEach(() => {
    mockLayoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST;
    mockIsSideColumnContext = false;
    mockIsInPinnedTab = false;
  });

  it('renders caller-provided edit controls without record-page dependencies', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode
        widgets={[
          makeWidget('first', WidgetType.FIELDS),
          makeWidget('second', WidgetType.FIELDS),
        ]}
        leadingElement={<button>Before widgets</button>}
        trailingElement={<button>After widgets</button>}
        renderWidgetSeparator={(widget) => <button>Before {widget.id}</button>}
      />,
    );

    expect(
      screen.getAllByRole('button').map(({ textContent }) => textContent),
    ).toEqual(['Before widgets', 'Before second', 'After widgets']);
    expect(screen.queryByText('Add widget')).not.toBeInTheDocument();
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

  it('keeps campaign documents fit-content so the tab owns scrolling', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          makeWidget('message-campaign-body', WidgetType.MESSAGE_CAMPAIGN_BODY),
        ]}
      />,
    );

    expect(
      screen
        .getByTestId('message-campaign-body')
        .closest('.page-layout-viewport-filling-widget-slot'),
    ).toBeNull();
    expect(
      screen.getByTestId('message-campaign-body-sortable-cell'),
    ).toHaveAttribute('data-fill', 'false');
  });

  it('keeps a legacy Canvas tab full-height when only one widget is visible', () => {
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

  it.each([
    { isInEditMode: true, isInPinnedTab: false },
    { isInEditMode: false, isInPinnedTab: true },
  ])(
    'preserves legacy Canvas sizing in $isInEditMode edit / $isInPinnedTab pinned mode',
    ({ isInEditMode, isInPinnedTab }) => {
      mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;
      mockIsInPinnedTab = isInPinnedTab;

      render(
        <PageLayoutVerticalList
          isInEditMode={isInEditMode}
          widgets={[makeWidget('front-component', WidgetType.FRONT_COMPONENT)]}
        />,
      );

      expect(
        screen.getByTestId('front-component-sortable-cell'),
      ).toHaveAttribute('data-fill', 'false');
    },
  );

  it('uses the default viewport height for a Timeline with a null position', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          { ...makeWidget('timeline', WidgetType.TIMELINE), position: null },
        ]}
      />,
    );

    expect(screen.getByTestId('timeline-sortable-cell')).toHaveAttribute(
      'data-fill',
      'true',
    );
  });

  it('keeps viewport-classified widgets fit-content in legacy Canvas tabs', () => {
    mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;

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
    ).toBeNull();
    expect(screen.getByTestId('timeline-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
    expect(screen.getByTestId('fields-sortable-cell')).toHaveAttribute(
      'data-fill',
      'false',
    );
  });

  it('gives an explicit TAB_VIEWPORT front component viewport-filling sizing in edit mode', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode
        widgets={[
          makeTabViewportWidget('front-component', WidgetType.FRONT_COMPONENT),
        ]}
      />,
    );

    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'true',
    );
  });

  it('keeps an explicit TAB_VIEWPORT front component viewport-filling in a side panel', () => {
    mockIsSideColumnContext = true;

    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          makeTabViewportWidget('front-component', WidgetType.FRONT_COMPONENT),
        ]}
      />,
    );

    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'true',
    );
  });

  it('keeps an explicit TAB_VIEWPORT widget viewport-filling in a pinned tab', () => {
    mockIsInPinnedTab = true;

    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          makeTabViewportWidget('front-component', WidgetType.FRONT_COMPONENT),
        ]}
      />,
    );

    expect(screen.getByTestId('front-component-sortable-cell')).toHaveAttribute(
      'data-fill',
      'true',
    );
  });

  it('keeps an explicit FIT_CONTENT viewport-classified widget fit-content', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[
          {
            ...makeWidget('timeline', WidgetType.TIMELINE),
            position: {
              __typename: 'PageLayoutWidgetVerticalListPosition',
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
              index: 0,
              heightBehavior:
                PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
            },
          },
        ]}
      />,
    );

    expect(screen.getByTestId('timeline-sortable-cell')).toHaveAttribute(
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

  it('lets the page scroll over a workflow in a multi-widget Canvas tab', () => {
    mockLayoutMode = PageLayoutTabLayoutMode.CANVAS;

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

  it('keeps page scroll disabled when the list cannot scroll', () => {
    render(
      <PageLayoutVerticalList
        isInEditMode={false}
        widgets={[makeWidget('fields', WidgetType.FIELDS)]}
      />,
    );

    expect(screen.getByTestId('fields')).toHaveAttribute(
      'data-allow-page-scroll',
      'false',
    );
  });
});
