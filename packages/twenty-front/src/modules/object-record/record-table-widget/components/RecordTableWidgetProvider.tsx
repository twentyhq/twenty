import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { RecordTableWidgetContextStoreInitEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetContextStoreInitEffect';
import { RecordTableWidgetViewLoadEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetViewLoadEffect';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isNonEmptyString } from '@sniptt/guards';
import { type PropsWithChildren, useCallback, useMemo } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

type RecordTableWidgetProviderProps = PropsWithChildren<{
  objectNameSingular: string;
  viewId: string;
  widgetId: string;
  recordLimit?: number;
  instanceIdSuffix?: string;
  contextStoreViewType?: ContextStoreViewType;
}>;

export const RecordTableWidgetProvider = ({
  objectNameSingular,
  viewId,
  widgetId,
  recordLimit,
  instanceIdSuffix,
  contextStoreViewType,
  children,
}: RecordTableWidgetProviderProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordIndexIdWithoutSuffix =
    getRecordIndexIdFromObjectNamePluralAndViewId(
      objectMetadataItem.namePlural,
      viewId,
    );

  const recordIndexId = isNonEmptyString(instanceIdSuffix)
    ? `${recordIndexIdWithoutSuffix}-${instanceIdSuffix}`
    : recordIndexIdWithoutSuffix;

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

  const pageLayoutComponentInstanceContext = useComponentInstanceStateContext(
    PageLayoutComponentInstanceContext,
  );

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const recordTableWidgetContext = useMemo(
    () => ({
      isPageLayoutInEditMode,
      pageLayoutId: pageLayoutComponentInstanceContext?.instanceId,
      widgetId,
    }),
    [
      isPageLayoutInEditMode,
      pageLayoutComponentInstanceContext?.instanceId,
      widgetId,
    ],
  );

  if (!objectPermissions.canReadObjectRecords) {
    return null;
  }

  return (
    <RecordTableWidgetContext.Provider value={recordTableWidgetContext}>
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: isNonEmptyString(instanceIdSuffix)
            ? `record-table-widget-${widgetId}-${instanceIdSuffix}`
            : `record-table-widget-${widgetId}`,
        }}
      >
        <RecordTableWidgetContextStoreInitEffect
          objectMetadataItemId={objectMetadataItem.id}
          viewId={viewId}
          contextStoreViewType={contextStoreViewType}
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
            recordLimit,
          }}
        >
          <ViewComponentInstanceContext.Provider
            value={{ instanceId: recordIndexId }}
          >
            <RecordComponentInstanceContextsWrapper
              componentInstanceId={recordIndexId}
            >
              <RecordTableWidgetViewLoadEffect
                viewId={viewId}
                widgetId={widgetId}
                objectMetadataItem={objectMetadataItem}
              />
              {children}
            </RecordComponentInstanceContextsWrapper>
          </ViewComponentInstanceContext.Provider>
        </RecordIndexContextProvider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordTableWidgetContext.Provider>
  );
};
