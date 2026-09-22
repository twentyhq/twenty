import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { buildTabWidgetLayouts } from '@/page-layout/utils/buildTabWidgetLayouts';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { widgetCreationTargetTabIdComponentState } from '@/page-layout/states/widgetCreationTargetTabIdComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SidePanelPageLayoutRecordPageWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutRecordPageWidgetTypeSelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import type * as TwentyIcons from 'twenty-ui/icon';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const mockNavigatePageLayoutSidePanel = jest.fn();
let mockObjectNameSingular = 'company';

jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual<typeof TwentyIcons>('twenty-ui/icon'),
  IconListDetails: () => <svg role="img" aria-label="Fields group icon" />,
  IconListSearch: () => <svg role="img" aria-label="Field icon" />,
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: { frontComponents: [] } }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: { id: 'company' } }),
}));

jest.mock(
  '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields',
  () => ({
    useFieldWidgetEligibleFields: () => [],
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      objectNameSingular: mockObjectNameSingular,
    }),
  }),
);

jest.mock('@/side-panel/components/SidePanelList', () => ({
  SidePanelList: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@/side-panel/components/SidePanelGroup', () => ({
  SidePanelGroup: ({
    heading,
    children,
  }: {
    heading: string;
    children: ReactNode;
  }) => (
    <section>
      <h2>{heading}</h2>
      {children}
    </section>
  ),
}));

jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/command-menu/components/CommandMenuItem', () => ({
  CommandMenuItem: ({
    label,
    description,
    onClick,
    Icon,
  }: {
    label: string;
    description?: string;
    onClick: () => void;
    Icon: IconComponent;
  }) => (
    <button aria-label={label} onClick={onClick}>
      <Icon />
      {label}
      {description}
    </button>
  ),
}));

describe('SidePanelPageLayoutRecordPageWidgetTypeSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjectNameSingular = 'company';
  });

  it('labels standard widgets and distinguishes a fields group from a single field', () => {
    const store = createStore();
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      makeDraft([makeTab('tab-1', [])]),
    );
    store.set(
      widgetCreationTargetTabIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      'tab-1',
    );

    render(
      <PageLayoutTestWrapper store={store}>
        <SidePanelPageLayoutRecordPageWidgetTypeSelect />
      </PageLayoutTestWrapper>,
    );

    expect(
      screen.getByRole('heading', { name: 'Standard widgets' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Widget type')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Fields group' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Field' })).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Fields group icon' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Field icon' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Transcript' }),
    ).not.toBeInTheDocument();
  });

  it.each(['calendarEvent', 'callRecording'])(
    'adds a transcript widget to the selected tab on %s',
    async (objectNameSingular) => {
      mockObjectNameSingular = objectNameSingular;
      const user = userEvent.setup();
      const store = createStore();
      const draftState = pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      });
      store.set(
        draftState,
        makeDraft([makeTab('tab-1', []), makeTab('tab-2', [])]),
      );
      store.set(
        widgetCreationTargetTabIdComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        'tab-2',
      );

      render(
        <PageLayoutTestWrapper store={store}>
          <SidePanelPageLayoutRecordPageWidgetTypeSelect />
        </PageLayoutTestWrapper>,
      );

      expect(
        screen.getByText('Render Transcript', { exact: false }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Transcript' }));

      const tabs = store.get(draftState).tabs;
      expect(tabs[0].widgets).toHaveLength(0);
      expect(tabs[1].widgets).toHaveLength(1);
      expect(tabs[1].widgets[0]).toMatchObject({
        title: 'Transcript',
        pageLayoutTabId: 'tab-2',
        type: WidgetType.CALL_RECORDING_TRANSCRIPT,
        configuration: {
          configurationType: WidgetConfigurationType.CALL_RECORDING_TRANSCRIPT,
        },
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
        },
      });
    },
  );

  it.each<{
    name: string;
    layoutMode: PageLayoutTabLayoutMode;
    position: PageLayoutWidget['position'];
    gridPosition?: PageLayoutWidget['gridPosition'];
  }>([
    {
      name: 'a vertical list with content height',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      position: {
        __typename: 'PageLayoutWidgetVerticalListPosition',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      },
    },
    {
      name: 'a vertical list with viewport height',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      position: {
        __typename: 'PageLayoutWidgetVerticalListPosition',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      },
    },
    {
      name: 'a grid',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      position: {
        __typename: 'PageLayoutWidgetGridPosition',
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 4,
        column: 3,
        rowSpan: 6,
        columnSpan: 5,
      },
    },
    {
      name: 'a canvas',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      position: {
        __typename: 'PageLayoutWidgetCanvasPosition',
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      },
    },
    {
      name: 'a legacy grid',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      position: null,
      gridPosition: {
        row: 4,
        column: 3,
        rowSpan: 6,
        columnSpan: 5,
      },
    },
  ])(
    'preserves placement when replacing a widget on $name',
    async ({ layoutMode, position, gridPosition }) => {
      mockObjectNameSingular = 'calendarEvent';
      const user = userEvent.setup();
      const store = createStore();
      const draftState = pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      });
      const existingWidgets = ['first', 'second', 'third'].map((id, index) => {
        const widget = buildDraftPageLayoutWidget({
          id,
          pageLayoutTabId: 'tab-2',
          title: id,
          type: WidgetType.CALL_RECORDING_SUMMARY,
          configuration: {
            __typename: 'CallRecordingSummaryConfiguration',
            configurationType: WidgetConfigurationType.CALL_RECORDING_SUMMARY,
          },
          position:
            layoutMode === PageLayoutTabLayoutMode.GRID
              ? {
                  layoutMode: PageLayoutTabLayoutMode.GRID,
                  row: index * 10,
                  column: 0,
                  rowSpan: 4,
                  columnSpan: 4,
                }
              : {
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  index,
                },
        });

        if (layoutMode === PageLayoutTabLayoutMode.CANVAS) {
          return { ...widget, position };
        }

        return widget;
      });
      existingWidgets[1] = { ...existingWidgets[1], position, gridPosition };
      const originalDraft = makeDraft([
        makeTab('tab-1', []),
        makeTab('tab-2', existingWidgets, 1, layoutMode),
      ]);
      store.set(draftState, originalDraft);
      const layoutsState = pageLayoutCurrentLayoutsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      });
      const tabLayouts = buildTabWidgetLayouts(existingWidgets);
      const originalLayouts: TabLayouts = {
        'tab-1': buildTabWidgetLayouts([]),
        'tab-2': {
          ...tabLayouts,
          mobile: tabLayouts.mobile?.map((layout) => ({
            ...layout,
            y: layout.y + 10,
          })),
        },
      };
      store.set(layoutsState, originalLayouts);
      store.set(
        pageLayoutEditingWidgetIdComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        'second',
      );

      render(
        <PageLayoutTestWrapper store={store}>
          <SidePanelPageLayoutRecordPageWidgetTypeSelect />
        </PageLayoutTestWrapper>,
      );
      await user.click(screen.getByRole('button', { name: 'Transcript' }));

      const updatedDraft = store.get(draftState);
      const widgets = updatedDraft.tabs[1].widgets;
      expect(widgets).toHaveLength(3);
      expect(updatedDraft.tabs[0]).toEqual(originalDraft.tabs[0]);
      expect(widgets[0]).toEqual(existingWidgets[0]);
      expect(widgets[2]).toEqual(existingWidgets[2]);
      expect(widgets[1]).toMatchObject({
        title: 'Transcript',
        pageLayoutTabId: 'tab-2',
        type: WidgetType.CALL_RECORDING_TRANSCRIPT,
        configuration: {
          configurationType: WidgetConfigurationType.CALL_RECORDING_TRANSCRIPT,
        },
        position,
        gridPosition,
      });
      expect(widgets[1].id).not.toBe('second');
      expect(
        convertPageLayoutDraftToUpdateInput(updatedDraft).tabs[1].widgets[1]
          .position,
      ).toEqual(
        convertPageLayoutDraftToUpdateInput(originalDraft).tabs[1].widgets[1]
          .position,
      );
      const updatedLayouts = store.get(layoutsState);
      expect(updatedLayouts['tab-1']).toEqual(originalLayouts['tab-1']);
      for (const breakpoint of ['desktop', 'mobile']) {
        expect(updatedLayouts['tab-2'][breakpoint]).toEqual(
          originalLayouts['tab-2'][breakpoint]?.map((layout) => ({
            ...layout,
            i: layout.i === 'second' ? widgets[1].id : layout.i,
          })),
        );
      }
    },
  );
});
