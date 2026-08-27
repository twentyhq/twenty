import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
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
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const mockCloseSidePanelMenu = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

describe('useCreateRecordPageNoteWidget', () => {
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
      <PageLayoutTestWrapper store={store}>
        <PageLayoutContentProvider
          value={{
            tabId: 'tab-1',
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            presentation: 'stack',
          }}
        >
          {children}
        </PageLayoutContentProvider>
      </PageLayoutTestWrapper>
    );

    const { result } = renderHook(() => useCreateRecordPageNoteWidget(), {
      wrapper,
    });

    act(() => result.current.createRecordPageNoteWidget());

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
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
  });
});
