import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { widgetCreationTargetTabIdComponentState } from '@/page-layout/states/widgetCreationTargetTabIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SidePanelPageLayoutRecordPageWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutRecordPageWidgetTypeSelect';
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import type * as TwentyIcons from 'twenty-ui/icon';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const mockNavigatePageLayoutSidePanel = jest.fn();
const mockObjectFields = jest.fn();

jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual<typeof TwentyIcons>('twenty-ui/icon'),
  IconListDetails: () => <svg role="img" aria-label="Fields group icon" />,
  IconListSearch: () => <svg role="img" aria-label="Field icon" />,
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: { frontComponents: [] } }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { id: 'note', fields: mockObjectFields() },
  }),
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
      objectNameSingular: 'note',
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
    onClick,
    Icon,
  }: {
    label: string;
    onClick: () => void;
    Icon: IconComponent;
  }) => (
    <button aria-label={label} onClick={onClick}>
      <Icon />
      {label}
    </button>
  ),
}));

describe('SidePanelPageLayoutRecordPageWidgetTypeSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjectFields.mockReturnValue([]);
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
      screen.queryByRole('button', { name: 'Files' }),
    ).not.toBeInTheDocument();
  });

  it('lets a Note with an active attachments relation restore its Files widget', () => {
    mockObjectFields.mockReturnValue([
      {
        name: 'attachments',
        type: FieldMetadataType.RELATION,
        isActive: true,
      },
    ]);

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

    fireEvent.click(screen.getByRole('button', { name: 'Files' }));

    const draft = store.get(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    );

    expect(draft.tabs[0].widgets).toEqual([
      expect.objectContaining({
        title: 'Files',
        type: WidgetType.FILES,
        objectMetadataId: 'note',
        configuration: expect.objectContaining({
          configurationType: WidgetConfigurationType.FILES,
        }),
      }),
    ]);
  });

  it('places a Files widget below existing widgets in a grid tab', () => {
    mockObjectFields.mockReturnValue([
      {
        name: 'attachments',
        type: FieldMetadataType.RELATION,
        isActive: true,
      },
    ]);

    const existingWidget = {
      ...makeWidget('existing', 0),
      position: {
        __typename: 'PageLayoutWidgetGridPosition' as const,
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 4,
      },
    };
    const store = createStore();
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      makeDraft([
        makeTab('tab-1', [existingWidget], 0, PageLayoutTabLayoutMode.GRID),
      ]),
    );
    store.set(
      pageLayoutCurrentLayoutsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        'tab-1': {
          desktop: [{ i: 'existing', x: 0, y: 0, w: 4, h: 4 }],
          mobile: [{ i: 'existing', x: 0, y: 6, w: 1, h: 4 }],
        },
      },
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

    fireEvent.click(screen.getByRole('button', { name: 'Files' }));

    const draft = store.get(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    );
    const filesWidget = draft.tabs[0].widgets[1];
    const layouts = store.get(
      pageLayoutCurrentLayoutsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    )['tab-1'];

    expect(filesWidget.position).toMatchObject({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 10,
      column: 0,
      rowSpan: 4,
      columnSpan: 4,
    });
    expect(layouts.desktop?.[1]).toMatchObject({
      i: filesWidget.id,
      x: 0,
      y: 10,
      w: 4,
      h: 4,
      minW: 2,
      minH: 2,
    });
    expect(layouts.mobile?.[1]).toMatchObject({
      i: filesWidget.id,
      x: 0,
      y: 10,
      w: 1,
      h: 4,
    });
  });

  it('keeps the grid position when replacing a widget with Files', () => {
    mockObjectFields.mockReturnValue([
      {
        name: 'attachments',
        type: FieldMetadataType.RELATION,
        isActive: true,
      },
    ]);

    const existingWidget = {
      ...makeWidget('existing', 0),
      position: {
        __typename: 'PageLayoutWidgetGridPosition' as const,
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 3,
        column: 2,
        rowSpan: 4,
        columnSpan: 4,
      },
    };
    const store = createStore();
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      makeDraft([
        makeTab('tab-1', [existingWidget], 0, PageLayoutTabLayoutMode.GRID),
      ]),
    );
    store.set(
      pageLayoutCurrentLayoutsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        'tab-1': {
          desktop: [{ i: 'existing', x: 2, y: 3, w: 4, h: 4 }],
          mobile: [{ i: 'existing', x: 0, y: 3, w: 1, h: 4 }],
        },
      },
    );
    store.set(
      pageLayoutEditingWidgetIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      'existing',
    );

    render(
      <PageLayoutTestWrapper store={store}>
        <SidePanelPageLayoutRecordPageWidgetTypeSelect />
      </PageLayoutTestWrapper>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Files' }));

    const draft = store.get(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    );
    const filesWidget = draft.tabs[0].widgets[0];
    const layouts = store.get(
      pageLayoutCurrentLayoutsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    )['tab-1'];

    expect(draft.tabs[0].widgets).toHaveLength(1);
    expect(filesWidget.position).toMatchObject({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 3,
      column: 2,
      rowSpan: 4,
      columnSpan: 4,
    });
    expect(layouts.desktop).toEqual([
      expect.objectContaining({ i: filesWidget.id, x: 2, y: 3 }),
    ]);
    expect(layouts.mobile).toEqual([
      expect.objectContaining({ i: filesWidget.id, x: 0, y: 3 }),
    ]);
  });
});
