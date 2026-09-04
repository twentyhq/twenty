import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { useCreateRecordPageNoteWidget } from '@/page-layout/hooks/useCreateRecordPageNoteWidget';
import { useInsertCreatedWidgetAtContext } from '@/page-layout/hooks/useInsertCreatedWidgetAtContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const mockNavigatePageLayoutSidePanel = jest.fn();

type NotePlacementTestCase = {
  mode: string;
  hasTasks?: boolean;
  widgetIdToReplace?: string;
  insertAboveWidgetId?: string;
  expectedTitles: string[];
};

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

describe('useCreateRecordPageNoteWidget', () => {
  beforeEach(() => jest.resetAllMocks());

  it.each<NotePlacementTestCase>([
    { mode: 'append', expectedTitles: ['first', 'second', 'third', 'Note'] },
    {
      mode: 'append with Tasks',
      hasTasks: true,
      expectedTitles: ['first', 'second', 'third', 'Note', 'Tasks'],
    },
    {
      mode: 'replace first',
      widgetIdToReplace: 'first',
      expectedTitles: ['Note', 'second', 'third'],
    },
    {
      mode: 'replace middle',
      widgetIdToReplace: 'second',
      expectedTitles: ['first', 'Note', 'third'],
    },
    {
      mode: 'replace last',
      widgetIdToReplace: 'third',
      expectedTitles: ['first', 'second', 'Note'],
    },
    {
      mode: 'replace with Tasks',
      hasTasks: true,
      widgetIdToReplace: 'second',
      expectedTitles: ['first', 'Note', 'third', 'Tasks'],
    },
    {
      mode: 'replace Tasks',
      hasTasks: true,
      widgetIdToReplace: 'tasks',
      expectedTitles: ['first', 'second', 'third', 'Note'],
    },
    {
      mode: 'insert above',
      insertAboveWidgetId: 'second',
      expectedTitles: ['first', 'Note', 'second', 'third'],
    },
    {
      mode: 'insert above with Tasks',
      hasTasks: true,
      insertAboveWidgetId: 'second',
      expectedTitles: ['first', 'Note', 'second', 'third', 'Tasks'],
    },
    {
      mode: 'insert before Tasks',
      hasTasks: true,
      insertAboveWidgetId: 'tasks',
      expectedTitles: ['first', 'second', 'third', 'Note', 'Tasks'],
    },
    {
      mode: 'insert first with Tasks',
      hasTasks: true,
      insertAboveWidgetId: 'first',
      expectedTitles: ['Note', 'first', 'second', 'third', 'Tasks'],
    },
  ])(
    'should $mode a Note in the requested position',
    ({ hasTasks, widgetIdToReplace, insertAboveWidgetId, expectedTitles }) => {
      const store = createStore();
      const instanceId = PAGE_LAYOUT_TEST_INSTANCE_ID;
      const draftAtom = pageLayoutDraftComponentState.atomFamily({
        instanceId,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      });
      const editingWidgetAtom =
        pageLayoutEditingWidgetIdComponentState.atomFamily({
          instanceId,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        });
      const widgets = [
        makeWidget('first', 0),
        makeWidget('second', 1),
        makeWidget('third', 2),
        ...(hasTasks
          ? [
              {
                ...makeWidget('tasks', 3),
                title: 'Tasks',
                type: WidgetType.TASKS,
              },
            ]
          : []),
      ];
      const otherTab = makeTab('other-tab', []);
      store.set(draftAtom, makeDraft([otherTab, makeTab('tab-1', widgets)]));
      if (insertAboveWidgetId !== undefined) {
        store.set(
          widgetInsertionContextComponentState.atomFamily({
            instanceId,
            surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
          { targetWidgetId: insertAboveWidgetId, direction: 'above' },
        );
      }
      const { result } = renderHook(
        () => ({
          ...useCreateRecordPageNoteWidget(),
          ...useInsertCreatedWidgetAtContext(),
        }),
        {
          wrapper: ({ children }: { children: ReactNode }) => (
            <PageLayoutTestWrapper store={store}>
              {children}
            </PageLayoutTestWrapper>
          ),
        },
      );
      act(() => {
        const widgetToReplace = widgets.find(
          ({ id }) => id === widgetIdToReplace,
        );
        if (isDefined(widgetToReplace)) {
          store.set(draftAtom, (draft) => ({
            ...draft,
            tabs: removeWidgetFromTab(draft.tabs, 'tab-1', widgetToReplace.id),
          }));
        }
        const note = result.current.createRecordPageNoteWidget({
          tabId: 'tab-1',
          positionIndex:
            isDefined(widgetToReplace?.position) &&
            isVerticalListPosition(widgetToReplace.position)
              ? widgetToReplace.position.index
              : undefined,
        });
        result.current.insertCreatedWidgetAtContext({ newWidgetId: note.id });
      });
      const draft = store.get(draftAtom);
      expect(draft.tabs[0]).toEqual(otherTab);
      expect(draft.tabs[1].widgets.map(({ title }) => title)).toEqual(
        expectedTitles,
      );
      expect(
        draft.tabs[1].widgets.map(({ position }) => position),
      ).toMatchObject(
        expectedTitles.map((_, index) => ({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index,
        })),
      );
      expect(
        draft.tabs[1].widgets.find(
          ({ id }) => id === store.get(editingWidgetAtom),
        ),
      ).toMatchObject({ title: 'Note', type: WidgetType.STANDALONE_RICH_TEXT });
    },
  );

  it('should append a shared Note to the target tab and start editing it', () => {
    const store = createStore();
    const draftAtom = pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    });
    const otherTab = makeTab('other-tab', []);

    store.set(
      draftAtom,
      makeDraft([makeTab('tab-1', [makeWidget('fields', 0)]), otherTab]),
    );

    const wrapper = ({ children }: { children: ReactNode }) => (
      <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
    );

    const { result } = renderHook(() => useCreateRecordPageNoteWidget(), {
      wrapper,
    });

    act(() => {
      result.current.createRecordPageNoteWidget({ tabId: 'tab-1' });
    });

    const draft = store.get(draftAtom);
    const note = draft.tabs[0].widgets[1];

    expect(draft.tabs[0].widgets).toHaveLength(2);
    expect(draft.tabs[1]).toEqual(otherTab);
    expect(note).toMatchObject({
      title: 'Note',
      type: WidgetType.STANDALONE_RICH_TEXT,
      objectMetadataId: null,
      pageLayoutTabId: 'tab-1',
      position: {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 1,
      },
      configuration: {
        configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
        body: { blocknote: '', markdown: null },
      },
    });
    expect(
      store.get(
        pageLayoutEditingWidgetIdComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    ).toBe(note.id);
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
      pageTitle: 'Note',
      resetNavigationStack: true,
    });
  });

  it('keeps the new Note selected when opening it interrupts a closing panel', () => {
    const store = createStore();
    const draftAtom = pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    });
    const editingWidgetAtom =
      pageLayoutEditingWidgetIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      });
    store.set(draftAtom, makeDraft([makeTab('tab-1', [])]));
    mockNavigatePageLayoutSidePanel.mockImplementationOnce(() => {
      store.set(editingWidgetAtom, null);
    });

    const { result } = renderHook(() => useCreateRecordPageNoteWidget(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
      ),
    });

    act(() => result.current.createRecordPageNoteWidget({ tabId: 'tab-1' }));

    expect(store.get(editingWidgetAtom)).toBe(
      store.get(draftAtom).tabs[0].widgets[0].id,
    );
  });
});
