import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useResolveFieldWidgetRelationTableViewIdChange } from '@/page-layout/widgets/record-table/hooks/useResolveFieldWidgetRelationTableViewIdChange';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { FieldDisplayMode } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const PAGE_LAYOUT_ID = 'page-layout-id';
const WIDGET_ID = 'widget-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const companyPeopleField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'people',
);

const personOpportunitiesField = personObjectMetadataItem.fields.find(
  (field) => field.name === 'pointOfContactForOpportunities',
);

const personCompanyField = personObjectMetadataItem.fields.find(
  (field) => field.name === 'company',
);

const companyOpportunitiesField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'opportunities',
);

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

const renderResolveHook = () => {
  const store = createStore();

  setTestObjectMetadataItemsInMetadataStore(
    store,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  const { result } = renderHook(
    () => useResolveFieldWidgetRelationTableViewIdChange(PAGE_LAYOUT_ID),
    { wrapper: getWrapper(store) },
  );

  return { result, store };
};

describe('useResolveFieldWidgetRelationTableViewIdChange', () => {
  it('should regenerate a view on the terminal object when the chain changes', () => {
    const { result, store } = renderResolveHook();

    let change: { viewId?: string | null } | undefined;

    act(() => {
      change = result.current.resolveFieldWidgetRelationTableViewIdChange({
        selectedField: companyPeopleField,
        selectedNestedField: personOpportunitiesField,
        nextDisplayMode: FieldDisplayMode.TABLE,
        isSelectingDifferentChain: true,
        widgetId: WIDGET_ID,
        currentViewId: 'previous-view-id',
      });
    });

    expect(change?.viewId).toBeDefined();

    const draft = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    );

    expect(draft[WIDGET_ID].view.objectMetadataId).toBe(
      opportunityObjectMetadataItem.id,
    );
  });

  it('should regenerate a view for a many-to-one first hop chain', () => {
    const { result, store } = renderResolveHook();

    let change: { viewId?: string | null } | undefined;

    act(() => {
      change = result.current.resolveFieldWidgetRelationTableViewIdChange({
        selectedField: personCompanyField,
        selectedNestedField: companyOpportunitiesField,
        nextDisplayMode: FieldDisplayMode.TABLE,
        isSelectingDifferentChain: true,
        widgetId: WIDGET_ID,
        currentViewId: undefined,
      });
    });

    expect(change?.viewId).toBeDefined();

    const draft = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    );

    expect(draft[WIDGET_ID].view.objectMetadataId).toBe(
      opportunityObjectMetadataItem.id,
    );
    // The intermediate is the single record the current record points at, so
    // the seeded filter carries no relation traversal.
    expect(draft[WIDGET_ID].viewFilters).toEqual([
      expect.objectContaining({
        fieldMetadataId:
          companyOpportunitiesField?.relation?.targetFieldMetadata.id,
        relationTargetFieldMetadataId: null,
      }),
    ]);
  });

  it('should regenerate a missing view even when the chain is unchanged', () => {
    const { result } = renderResolveHook();

    let change: { viewId?: string | null } | undefined;

    act(() => {
      change = result.current.resolveFieldWidgetRelationTableViewIdChange({
        selectedField: companyPeopleField,
        selectedNestedField: personOpportunitiesField,
        nextDisplayMode: FieldDisplayMode.TABLE,
        isSelectingDifferentChain: false,
        widgetId: WIDGET_ID,
        currentViewId: undefined,
      });
    });

    expect(change?.viewId).toBeDefined();
  });

  it('should keep the current view when the chain and view are unchanged', () => {
    const { result } = renderResolveHook();

    let change: { viewId?: string | null } | undefined;

    act(() => {
      change = result.current.resolveFieldWidgetRelationTableViewIdChange({
        selectedField: companyPeopleField,
        selectedNestedField: personOpportunitiesField,
        nextDisplayMode: FieldDisplayMode.TABLE,
        isSelectingDifferentChain: false,
        widgetId: WIDGET_ID,
        currentViewId: 'current-view-id',
      });
    });

    expect(change).toBeUndefined();
  });

  it('should clear a stale view when the next display mode is not table', () => {
    const { result } = renderResolveHook();

    let change: { viewId?: string | null } | undefined;

    act(() => {
      change = result.current.resolveFieldWidgetRelationTableViewIdChange({
        selectedField: companyPeopleField,
        nextDisplayMode: FieldDisplayMode.CARD,
        isSelectingDifferentChain: true,
        widgetId: WIDGET_ID,
        currentViewId: 'previous-view-id',
      });
    });

    expect(change).toEqual({ viewId: undefined });
  });
});
