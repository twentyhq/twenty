import { useApolloClient } from '@apollo/client/react';
import { useCallback, useContext } from 'react';

import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { START_EXPORT_JOB } from '@/object-record/record-index/export/graphql/mutations/startExportJob';
import { useExportableRelationFields } from '@/object-record/record-index/export/hooks/useExportableRelationFields';
import { useExportJobProgress } from '@/object-record/record-index/export/hooks/useExportJobProgress';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

type StartExportJobResponse = {
  startExportJob?: {
    id: string;
    status: string;
    totalRecords: number;
  };
};

export const ExportMultipleRecordsCommand = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    contextStoreCurrentViewId,
  );

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

  // Get current sort order
  const findManyRecordsParams = useFindManyRecordIndexTableParams(
    objectMetadataItem.nameSingular,
    recordIndexId,
  );

  // Get visible columns
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  // OMNIA-CUSTOM: Separate direct fields from sub-field columns
  const directRecordFields = visibleRecordFields.filter(
    (f: RecordField) => !f.subFieldName,
  );
  const subFieldRecordFields = visibleRecordFields.filter(
    (f: RecordField) => !!f.subFieldName,
  );

  const visibleFieldNames = directRecordFields
    .map((field: RecordField) => {
      const fieldMetadataItem = objectMetadataItem.fields.find(
        (f) => f.id === field.fieldMetadataItemId,
      );

      return fieldMetadataItem?.name ?? '';
    })
    .filter(Boolean);

  const columns = directRecordFields
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

  const apolloClient = useApolloClient();
  const { startTracking } = useExportJobProgress();
  const { closeCommandMenu } = useCloseCommandMenu({});
  const { enqueueErrorSnackBar } = useSnackBar();

  const actionConfig = useContext(CommandConfigContext);

  const handleClick = useCallback(async () => {
    // Auto-build relation configs: select all available sub-fields
    const relationConfigs = exportableRelationFields.map((erf) => ({
      relationFieldName: erf.fieldName,
      relationFieldLabel: erf.fieldLabel,
      targetObjectNameSingular: erf.targetObjectNameSingular,
      selectedFieldPaths: erf.exportableSubFields.map((sf) => sf.fieldPath),
    }));

    // OMNIA-CUSTOM: Merge sub-field columns into relation configs
    for (const subField of subFieldRecordFields) {
      const relationFieldMeta = objectMetadataItem.fields.find(
        (f) => f.id === subField.fieldMetadataItemId,
      );

      if (!relationFieldMeta || !subField.subFieldName) continue;

      const existingConfig = relationConfigs.find(
        (rc) => rc.relationFieldName === relationFieldMeta.name,
      );

      if (existingConfig) {
        if (
          !existingConfig.selectedFieldPaths.includes(subField.subFieldName)
        ) {
          existingConfig.selectedFieldPaths.push(subField.subFieldName);
        }
      } else {
        const targetNameSingular =
          relationFieldMeta.relation?.targetObjectMetadata?.nameSingular;

        if (targetNameSingular) {
          relationConfigs.push({
            relationFieldName: relationFieldMeta.name,
            relationFieldLabel: relationFieldMeta.label,
            targetObjectNameSingular: targetNameSingular,
            selectedFieldPaths: [subField.subFieldName],
          });
        }
      }
    }

    try {
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

      closeCommandMenu();
    } catch (error) {
      enqueueErrorSnackBar({
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      closeCommandMenu();
    }
  }, [
    apolloClient,
    objectMetadataItem,
    columns,
    queryFilter,
    findManyRecordsParams.orderBy,
    exportableRelationFields,
    subFieldRecordFields,
    startTracking,
    closeCommandMenu,
    enqueueErrorSnackBar,
  ]);

  if (!isDefined(actionConfig)) {
    return null;
  }

  return (
    <CommandConfigContext.Provider value={actionConfig}>
      <CommandMenuItemDisplay onClick={handleClick} />
    </CommandConfigContext.Provider>
  );
};
