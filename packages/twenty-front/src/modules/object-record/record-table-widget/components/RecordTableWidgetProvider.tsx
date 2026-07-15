import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { RecordTableWidgetContextStoreInitEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetContextStoreInitEffect';
import { RecordTableWidgetViewLoadEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetViewLoadEffect';
import { RecordTableWidgetViewContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetViewContext';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewDraftByWidgetIdComponentFamilySelector } from '@/page-layout/states/selectors/recordTableWidgetViewDraftByWidgetIdComponentFamilySelector';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useStore } from 'jotai';
import { type PropsWithChildren, useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

type RecordTableWidgetProviderProps = PropsWithChildren<{
  objectNameSingular: string;
  viewId: string;
  widgetId: string;
}>;

export const RecordTableWidgetProvider = ({
  objectNameSingular,
  viewId,
  widgetId,
  children,
}: RecordTableWidgetProviderProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    viewId,
  );

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const draftSnapshot = useAtomComponentFamilySelectorValue(
    recordTableWidgetViewDraftByWidgetIdComponentFamilySelector,
    { widgetId },
  );
  const viewFromDraft =
    isPageLayoutInEditMode && isDefined(draftSnapshot)
      ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
      : undefined;
  const viewFromSelector = useAtomFamilySelectorValue(
    viewFromViewIdFamilySelector,
    { viewId },
  );
  const currentView = viewFromDraft ?? viewFromSelector;

  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
  );
  const store = useStore();
  const updateDraftViewFieldAggregateOperation = useCallback(
    (
      fieldMetadataId: string,
      aggregateOperation: AggregateOperations | null,
    ) => {
      store.set(recordTableWidgetViewDraftState, (previousDraft) => {
        const widgetViewDraft = previousDraft[widgetId];

        if (!isDefined(widgetViewDraft)) {
          return previousDraft;
        }

        return {
          ...previousDraft,
          [widgetId]: {
            ...widgetViewDraft,
            viewFields: widgetViewDraft.viewFields.map((field) =>
              field.fieldMetadataId === fieldMetadataId
                ? { ...field, aggregateOperation }
                : field,
            ),
          },
        };
      });
    },
    [recordTableWidgetViewDraftState, store, widgetId],
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  const {
    fieldDefinitionByFieldMetadataItemId,
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    recordFieldByFieldMetadataItemId,
  } = useRecordIndexFieldMetadataDerivedStates(
    objectMetadataItem,
    recordIndexId,
  );

  const indexIdentifierUrl = useCallback(
    (recordId: string) => {
      return getAppPath(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      });
    },
    [objectNameSingular],
  );

  const handleIndexRecordsLoaded = useCallback(() => {}, []);

  if (!objectPermissions.canReadObjectRecords) {
    return null;
  }

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: `record-table-widget-${widgetId}` }}
    >
      <RecordTableWidgetContextStoreInitEffect
        objectMetadataItemId={objectMetadataItem.id}
        viewId={viewId}
      />
      <RecordIndexContextProvider
        value={{
          objectPermissionsByObjectMetadataId,
          recordIndexId,
          viewBarInstanceId: recordIndexId,
          objectNamePlural: objectMetadataItem.namePlural,
          objectNameSingular,
          objectMetadataItem,
          onIndexRecordsLoaded: handleIndexRecordsLoaded,
          indexIdentifierUrl,
          recordFieldByFieldMetadataItemId,
          labelIdentifierFieldMetadataItem,
          fieldMetadataItemByFieldMetadataItemId,
          fieldDefinitionByFieldMetadataItemId,
        }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <RecordComponentInstanceContextsWrapper
            componentInstanceId={recordIndexId}
          >
            <RecordTableWidgetViewContext.Provider
              value={{
                currentView,
                updateDraftViewFieldAggregateOperation: isDefined(viewFromDraft)
                  ? updateDraftViewFieldAggregateOperation
                  : undefined,
              }}
            >
              <RecordTableWidgetViewLoadEffect
                viewId={viewId}
                objectMetadataItem={objectMetadataItem}
              />
              {children}
            </RecordTableWidgetViewContext.Provider>
          </RecordComponentInstanceContextsWrapper>
        </ViewComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
