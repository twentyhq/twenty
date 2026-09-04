import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { useCreateRecordPageFieldWidget } from '@/page-layout/hooks/useCreateRecordPageFieldWidget';
import { useCreateRecordPageFieldsWidget } from '@/page-layout/hooks/useCreateRecordPageFieldsWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const mockNavigatePageLayoutSidePanel = jest.fn();

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({ targetObjectNameSingular: 'company' }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { id: 'company-metadata' },
  }),
}));

jest.mock(
  '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields',
  () => ({
    useFieldWidgetEligibleFields: () => [],
  }),
);

describe('record-page field widget creation', () => {
  beforeEach(() => jest.resetAllMocks());

  it.each([
    {
      widgetType: WidgetType.FIELD,
      sidePanelPage: SidePanelPages.RecordPageFieldSettings,
    },
    {
      widgetType: WidgetType.FIELDS,
      sidePanelPage: SidePanelPages.RecordPageFieldsSettings,
    },
  ])(
    'keeps $widgetType selected when creation reopens a closing panel',
    ({ widgetType, sidePanelPage }) => {
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
      store.set(isLayoutCustomizationModeEnabledState.atom, true);
      store.set(draftAtom, makeDraft([makeTab('tab-1', [])]));
      mockNavigatePageLayoutSidePanel.mockImplementationOnce(() => {
        store.set(editingWidgetAtom, null);
      });

      const { result } = renderHook(
        () => {
          const { createRecordPageFieldWidget } =
            useCreateRecordPageFieldWidget();
          const { createRecordPageFieldsWidget } =
            useCreateRecordPageFieldsWidget();
          return widgetType === WidgetType.FIELD
            ? createRecordPageFieldWidget
            : createRecordPageFieldsWidget;
        },
        {
          wrapper: ({ children }: { children: ReactNode }) => (
            <PageLayoutTestWrapper
              store={store}
              layoutType={PageLayoutType.RECORD_PAGE}
            >
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
          ),
        },
      );

      act(() => {
        result.current();
      });

      const widget = store.get(draftAtom).tabs[0].widgets[0];
      expect(widget.type).toBe(widgetType);
      expect(store.get(editingWidgetAtom)).toBe(widget.id);
      expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
        sidePanelPage,
        focusTitleInput: true,
        resetNavigationStack: true,
      });
    },
  );
});
