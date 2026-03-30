import { useApolloClient } from '@apollo/client/react';
import { useCallback, useRef } from 'react';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { EngineCommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/EngineCommandComponentInstanceContext';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { START_EXPORT_JOB } from '@/object-record/record-index/export/graphql/mutations/startExportJob';
import { useExportableRelationFields } from '@/object-record/record-index/export/hooks/useExportableRelationFields';
import { useExportJobProgress } from '@/object-record/record-index/export/hooks/useExportJobProgress';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

type StartExportJobResponse = {
  startExportJob?: {
    id: string;
    status: string;
    totalRecords: number;
  };
};

const ExportMultipleRecordsCommandContent = ({
  objectMetadataItem,
  recordIndexId,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
  setCommandMenuItemProgress: (value: number | undefined) => void;
}) => {
  const apolloClient = useApolloClient();
  const { startTracking } = useExportJobProgress();
  const startedRef = useRef(false);

  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    EngineCommandComponentInstanceContext,
  );
  const unmountEngineCommand = useUnmountEngineCommand();

  // Get current filters
  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );
  const contextStoreFilters = useAtomComponentStateValue(
    contextStoreFiltersComponentState,
  );
  const contextStoreFilterGroups = useAtomComponentStateValue(
    contextStoreFilterGroupsComponentState,
  );
  const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
    contextStoreAnyFieldFilterValueComponentState,
  );
  const { filterValueDependencies } = useFilterValueDependencies();

  const queryFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  });

  const findManyRecordsParams = useFindManyRecordIndexTableParams(
    objectMetadataItem.nameSingular,
    recordIndexId,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  const visibleFieldNames = visibleRecordFields
    .map((field: RecordField) => {
      const fieldMetadataItem = objectMetadataItem.fields.find(
        (f) => f.id === field.fieldMetadataItemId,
      );

      return fieldMetadataItem?.name ?? '';
    })
    .filter(Boolean);

  const columns = visibleRecordFields
    .map((field: RecordField) => {
      const fieldMetadataItem = objectMetadataItem.fields.find(
        (f) => f.id === field.fieldMetadataItemId,
      );

      if (!fieldMetadataItem) return null;

      return {
        fieldName: fieldMetadataItem.name,
        label: fieldMetadataItem.label,
        type: fieldMetadataItem.type,
      };
    })
    .filter(isDefined);

  const exportableRelationFields = useExportableRelationFields({
    objectMetadataItem,
    visibleFieldNames,
  });

  const doExport = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Auto-build relation configs: select all available sub-fields
    const relationConfigs = exportableRelationFields.map((erf) => ({
      relationFieldName: erf.fieldName,
      relationFieldLabel: erf.fieldLabel,
      targetObjectNameSingular: erf.targetObjectNameSingular,
      selectedFieldPaths: erf.exportableSubFields.map((sf) => sf.fieldPath),
    }));

    const { data } = await apolloClient.mutate<StartExportJobResponse>({
      mutation: START_EXPORT_JOB,
      variables: {
        objectNameSingular: objectMetadataItem.nameSingular,
        columns,
        filter: queryFilter,
        orderBy: findManyRecordsParams.orderBy,
        relationConfigs:
          relationConfigs.length > 0 ? relationConfigs : undefined,
      },
    });

    const exportJob = data?.startExportJob;

    if (exportJob?.id) {
      startTracking({
        exportJobId: exportJob.id,
        objectNameSingular: objectMetadataItem.nameSingular,
        objectNamePlural: objectMetadataItem.namePlural,
      });
    }

    unmountEngineCommand(engineCommandId);
  }, [
    apolloClient,
    objectMetadataItem.nameSingular,
    objectMetadataItem.namePlural,
    columns,
    queryFilter,
    findManyRecordsParams.orderBy,
    exportableRelationFields,
    startTracking,
    unmountEngineCommand,
    engineCommandId,
  ]);

  return <HeadlessEngineCommandWrapperEffect execute={doExport} />;
};

export const ExportMultipleRecordsCommand = () => {
  const { objectMetadataItem, recordIndexId } =
    useMountedEngineCommandContext();

  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    EngineCommandComponentInstanceContext,
  );

  const setCommandMenuItemProgress = useSetAtomFamilyState(
    commandMenuItemProgressFamilyState,
    engineCommandId,
  );

  if (!isDefined(objectMetadataItem) || !isDefined(recordIndexId)) {
    throw new Error(
      'Object metadata item and record index ID are required to export multiple records',
    );
  }

  return (
    <ViewComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      <ExportMultipleRecordsCommandContent
        objectMetadataItem={objectMetadataItem}
        recordIndexId={recordIndexId}
        setCommandMenuItemProgress={setCommandMenuItemProgress}
      />
    </ViewComponentInstanceContext.Provider>
  );
};
