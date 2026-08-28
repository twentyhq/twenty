import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { widgetCreationTargetTabIdComponentState } from '@/page-layout/states/widgetCreationTargetTabIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SidePanelPageLayoutRecordPageWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutRecordPageWidgetTypeSelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';
import type * as TwentyIcons from 'twenty-ui/icon';
import { WidgetType } from '~/generated-metadata/graphql';

const mockNavigatePageLayoutSidePanel = jest.fn();

jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual<typeof TwentyIcons>('twenty-ui/icon'),
  IconStack2: () => <svg role="img" aria-label="Fields group icon" />,
  IconListDetails: () => <svg role="img" aria-label="Field icon" />,
  IconNotes: () => <svg role="img" aria-label="Note icon" />,
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
      objectNameSingular: 'company',
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
  beforeEach(() => jest.clearAllMocks());

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
    expect(screen.getByRole('img', { name: 'Note icon' })).toBeInTheDocument();
  });

  it.each([
    { mode: 'append', expectedTitles: ['first', 'second', 'third', 'Note'] },
    {
      mode: 'append with Tasks',
      expectedTitles: ['first', 'second', 'third', 'Note', 'Tasks'],
    },
    { mode: 'replace', expectedTitles: ['first', 'Note', 'third'] },
    {
      mode: 'replace with Tasks',
      expectedTitles: ['first', 'Note', 'third', 'Tasks'],
    },
    {
      mode: 'insert above',
      expectedTitles: ['first', 'Note', 'second', 'third'],
    },
    {
      mode: 'insert above with Tasks',
      expectedTitles: ['first', 'Note', 'second', 'third', 'Tasks'],
    },
    {
      mode: 'insert before Tasks with Tasks',
      expectedTitles: ['first', 'second', 'third', 'Note', 'Tasks'],
    },
    {
      mode: 'insert first with Tasks',
      expectedTitles: ['Note', 'first', 'second', 'third', 'Tasks'],
    },
  ])(
    'should $mode a Note in the requested position',
    async ({ mode, expectedTitles }) => {
      const store = createStore();
      const instanceId = PAGE_LAYOUT_TEST_INSTANCE_ID;
      const draftAtom = pageLayoutDraftComponentState.atomFamily({
        instanceId,
      });
      const editingWidgetIdAtom =
        pageLayoutEditingWidgetIdComponentState.atomFamily({ instanceId });

      store.set(
        draftAtom,
        makeDraft([
          makeTab('other-tab', []),
          makeTab('tab-1', [
            makeWidget('first', 0),
            makeWidget('second', 1),
            makeWidget('third', 2),
            ...(mode.endsWith('with Tasks')
              ? [
                  {
                    ...makeWidget('tasks', 3),
                    title: 'Tasks',
                    type: WidgetType.TASKS,
                  },
                ]
              : []),
          ]),
        ]),
      );
      store.set(
        widgetCreationTargetTabIdComponentState.atomFamily({ instanceId }),
        'tab-1',
      );

      if (mode.startsWith('replace')) {
        store.set(editingWidgetIdAtom, 'second');
      }

      if (mode.startsWith('insert')) {
        store.set(
          widgetInsertionContextComponentState.atomFamily({ instanceId }),
          {
            targetWidgetId: mode.startsWith('insert before Tasks')
              ? 'tasks'
              : mode.startsWith('insert first')
                ? 'first'
                : 'second',
            direction: 'above',
          },
        );
      }

      render(
        <PageLayoutTestWrapper store={store}>
          <SidePanelPageLayoutRecordPageWidgetTypeSelect />
        </PageLayoutTestWrapper>,
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Note' }));

      const draft = store.get(draftAtom);
      expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
        sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
        pageTitle: 'Note',
        resetNavigationStack: true,
      });
      expect(draft.tabs[0].widgets).toEqual([]);
      expect(draft.tabs[1].widgets.map(({ title }) => title)).toEqual(
        expectedTitles,
      );
      expect(draft.tabs[1].widgets.map(({ position }) => position)).toEqual(
        expectedTitles.map((_, index) => expect.objectContaining({ index })),
      );
      expect(
        draft.tabs[1].widgets.find(
          ({ id }) => id === store.get(editingWidgetIdAtom),
        ),
      ).toMatchObject({
        title: 'Note',
        type: WidgetType.STANDALONE_RICH_TEXT,
      });
    },
  );
});
