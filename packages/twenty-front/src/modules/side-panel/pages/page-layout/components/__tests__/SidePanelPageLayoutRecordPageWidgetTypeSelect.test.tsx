import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
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

  it('replaces a widget without changing its position or the other widgets', async () => {
    mockObjectNameSingular = 'calendarEvent';
    const user = userEvent.setup();
    const store = createStore();
    const draftState = pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });
    const existingWidgets = ['first', 'second'].map((id, index) =>
      buildDraftPageLayoutWidget({
        id,
        pageLayoutTabId: 'tab-1',
        title: id,
        type: WidgetType.CALL_RECORDING_SUMMARY,
        configuration: {
          __typename: 'CallRecordingSummaryConfiguration',
          configurationType: WidgetConfigurationType.CALL_RECORDING_SUMMARY,
        },
        position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index },
      }),
    );
    store.set(draftState, makeDraft([makeTab('tab-1', existingWidgets)]));
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

    const widgets = store.get(draftState).tabs[0].widgets;
    expect(widgets).toHaveLength(2);
    expect(widgets[0]).toEqual(existingWidgets[0]);
    expect(widgets[1]).toMatchObject({
      title: 'Transcript',
      position: { index: 1 },
    });
    expect(widgets[1].id).not.toBe('second');
  });
});
