import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { useCreateRecordPageNoteWidget } from '@/page-layout/hooks/useCreateRecordPageNoteWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const mockNavigatePageLayoutSidePanel = jest.fn();

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

  it('should append a shared Note to the target tab and start editing it', () => {
    const store = createStore();
    const draftAtom = pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
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
    });
    const editingWidgetAtom =
      pageLayoutEditingWidgetIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
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
