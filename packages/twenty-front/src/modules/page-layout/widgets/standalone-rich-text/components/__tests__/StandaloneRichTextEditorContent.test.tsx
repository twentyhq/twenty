import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { createDefaultStandaloneRichTextWidget } from '@/page-layout/utils/createDefaultStandaloneRichTextWidget';
import { StandaloneRichTextEditorContent } from '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextEditorContent';
import { StandaloneRichTextWidget } from '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextWidget';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

jest.mock('@blocknote/react', () => ({
  useCreateBlockNote: () => ({
    document: [{ type: 'paragraph', content: 'Shared instructions' }],
  }),
}));

jest.mock(
  '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema',
  () => ({ DASHBOARD_BLOCK_SCHEMA: { blockSchema: { paragraph: {} } } }),
);

jest.mock(
  '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextWidgetAutoFocusEffect',
  () => ({ StandaloneRichTextWidgetAutoFocusEffect: () => null }),
);

jest.mock(
  '@/page-layout/widgets/standalone-rich-text/components/DashboardsBlockEditor',
  () => ({
    DashboardsBlockEditor: ({
      onChange,
      onFocus,
      onBlur,
      readonly,
    }: {
      onChange: () => void;
      onFocus: () => void;
      onBlur: () => void;
      readonly: boolean;
    }) => (
      <>
        <textarea
          aria-label="Note content"
          defaultValue="Shared instructions"
          readOnly={readonly}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
        />
        <button onClick={onChange}>Edit note</button>
      </>
    ),
  }),
);

jest.mock('@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack', () => ({
  usePushFocusItemToFocusStack: () => ({
    pushFocusItemToFocusStack: jest.fn(),
  }),
}));

jest.mock(
  '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById',
  () => ({
    useRemoveFocusItemFromFocusStackById: () => ({
      removeFocusItemFromFocusStackById: jest.fn(),
    }),
  }),
);

describe('StandaloneRichTextEditorContent', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it.each([
    { mode: 'record layout', dashboard: false },
    { mode: 'dashboard', dashboard: true },
  ])(
    'preserves selection without retargeting widget settings in $mode',
    async ({ dashboard }) => {
      const store = createStore();
      const instanceId = 'note-layout';
      const editingWidgetAtom =
        pageLayoutEditingWidgetIdComponentState.atomFamily({ instanceId });
      const widget = createDefaultStandaloneRichTextWidget({
        id: 'note-widget',
        pageLayoutTabId: 'tab-1',
        body: { blocknote: '', markdown: null },
        title: 'Note',
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
        },
      });

      store.set(isLayoutCustomizationModeEnabledState.atom, !dashboard);
      store.set(
        isDashboardInEditModeComponentState.atomFamily({ instanceId }),
        dashboard,
      );
      store.set(editingWidgetAtom, 'other-widget');

      render(
        <Provider store={store}>
          <PageLayoutComponentInstanceContext.Provider value={{ instanceId }}>
            <PageLayoutEditModeProviderContext value={{ isInEditMode: true }}>
              <StandaloneRichTextWidget widget={widget} />
            </PageLayoutEditModeProviderContext>
          </PageLayoutComponentInstanceContext.Provider>
        </Provider>,
      );

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const textbox = screen.getByRole<HTMLTextAreaElement>('textbox', {
        name: 'Note content',
      });

      expect(textbox).not.toHaveAttribute('readonly');
      await user.tripleClick(textbox);

      expect(store.get(editingWidgetAtom)).toBe('other-widget');
      expect(screen.getByRole('textbox', { name: 'Note content' })).toBe(
        textbox,
      );
      expect(textbox).toHaveFocus();
      expect(textbox.selectionStart).toBe(0);
      expect(textbox.selectionEnd).toBe('Shared instructions'.length);

      act(() => store.set(editingWidgetAtom, widget.id));

      expect(screen.getByRole('textbox', { name: 'Note content' })).toBe(
        textbox,
      );
      expect(textbox).toHaveFocus();
      expect(textbox.selectionEnd).toBe('Shared instructions'.length);
    },
  );

  it('keeps a Note read-only outside layout editing', async () => {
    const store = createStore();
    const instanceId = 'note-layout';
    const editingWidgetAtom =
      pageLayoutEditingWidgetIdComponentState.atomFamily({ instanceId });
    const widget = createDefaultStandaloneRichTextWidget({
      id: 'note-widget',
      pageLayoutTabId: 'tab-1',
      body: { blocknote: '', markdown: null },
      title: 'Note',
      position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
    });

    render(
      <Provider store={store}>
        <PageLayoutComponentInstanceContext.Provider value={{ instanceId }}>
          <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
            <StandaloneRichTextWidget widget={widget} />
          </PageLayoutEditModeProviderContext>
        </PageLayoutComponentInstanceContext.Provider>
      </Provider>,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const textbox = screen.getByRole('textbox', { name: 'Note content' });
    const initialEditingWidgetId = store.get(editingWidgetAtom);

    await user.type(textbox, 'Changed');

    expect(textbox).toHaveAttribute('readonly');
    expect(textbox).toHaveValue('Shared instructions');
    expect(store.get(editingWidgetAtom)).toBe(initialEditingWidgetId);
  });

  it.each([
    {
      mode: 'record layout',
      dashboard: false,
      customization: true,
      persists: true,
    },
    {
      mode: 'dashboard',
      dashboard: true,
      customization: false,
      persists: true,
    },
    {
      mode: 'read only',
      dashboard: false,
      customization: false,
      persists: false,
    },
    {
      mode: 'another widget',
      dashboard: false,
      customization: true,
      persists: true,
    },
    {
      mode: 'not editable',
      dashboard: false,
      customization: true,
      persists: false,
    },
    {
      mode: 'cancelled editing',
      dashboard: false,
      customization: true,
      persists: false,
    },
  ])(
    'should respect draft persistence in $mode mode',
    async ({ mode, dashboard, customization, persists }) => {
      const store = createStore();
      const instanceId = 'note-layout';
      const draftAtom = pageLayoutDraftComponentState.atomFamily({
        instanceId,
      });
      const widget = createDefaultStandaloneRichTextWidget({
        id: 'note-widget',
        pageLayoutTabId: 'tab-1',
        body: { blocknote: '', markdown: null },
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
        },
        title: 'Note',
      });

      store.set(draftAtom, makeDraft([makeTab('tab-1', [widget])]));
      store.set(isLayoutCustomizationModeEnabledState.atom, customization);
      store.set(
        isDashboardInEditModeComponentState.atomFamily({ instanceId }),
        dashboard,
      );
      store.set(
        pageLayoutEditingWidgetIdComponentState.atomFamily({ instanceId }),
        mode === 'another widget' ? 'other-widget' : widget.id,
      );

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <Provider store={store}>
          <PageLayoutComponentInstanceContext.Provider value={{ instanceId }}>
            <StandaloneRichTextEditorContent
              widget={widget}
              currentBody=""
              isEditable={mode !== 'not editable'}
              containerElement={null}
            />
          </PageLayoutComponentInstanceContext.Provider>
        </Provider>,
      );

      await user.click(screen.getByRole('button', { name: 'Edit note' }));

      if (mode === 'cancelled editing') {
        store.set(isLayoutCustomizationModeEnabledState.atom, false);
      }

      act(() => jest.advanceTimersByTime(300));

      expect(
        store.get(draftAtom).tabs[0].widgets[0].configuration,
      ).toMatchObject({
        body: {
          blocknote: persists
            ? JSON.stringify([
                { type: 'paragraph', content: 'Shared instructions' },
              ])
            : '',
          markdown: null,
        },
      });
    },
  );
});
