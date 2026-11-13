import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { computeScopedRelationArgs } from '@/object-record/record-column-scope/utils/computeScopedRelationArgs';
import { getScopedRelationAlias } from '@/object-record/record-column-scope/utils/getScopedRelationAlias';
import { isRecordFieldScoped } from '@/object-record/record-column-scope/utils/isRecordFieldScoped';
import { isScopableRelationField } from '@/object-record/record-column-scope/utils/isScopableRelationField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { scopeViewsByOwnerViewFieldIdMapSelector } from '@/views/states/selectors/scopeViewsByOwnerViewFieldIdMapSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useScopedRelationAliases = (): RecordGqlRelationAlias[] => {
  const isColumnSettingsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COLUMN_SETTINGS_ENABLED,
  );
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  const scopeViewsByOwnerViewFieldIdMap = useAtomStateValue(
    scopeViewsByOwnerViewFieldIdMapSelector,
  );
  const { filterValueDependencies } = useFilterValueDependencies();

  return useMemo(() => {
    if (!isColumnSettingsEnabled) {
      return [];
    }

    return visibleRecordFields.flatMap((recordField) => {
      const fieldMetadataItem =
        fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];
      const scopeView = scopeViewsByOwnerViewFieldIdMap.get(recordField.id);

      if (
        !isDefined(fieldMetadataItem) ||
        !isScopableRelationField(fieldMetadataItem) ||
        !isRecordFieldScoped({ recordField, scopeView })
      ) {
        return [];
      }

      const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
        fieldMetadataItem,
        objectMetadataItems,
      });

      if (!isDefined(relationObjectMetadataItem)) {
        return [];
      }

      return [
        {
          alias: getScopedRelationAlias(recordField.id),
          fieldName: fieldMetadataItem.name,
          relationObjectMetadataItem,
          ...computeScopedRelationArgs({
            scopeView,
            recordLimit: recordField.settings?.recordLimit,
            relationObjectMetadataItem,
            objectMetadataItems,
            fieldMetadataItems: flattenedFieldMetadataItems,
            filterValueDependencies,
          }),
        },
      ];
    });
  }, [
    isColumnSettingsEnabled,
    visibleRecordFields,
    fieldMetadataItemByFieldMetadataItemId,
    scopeViewsByOwnerViewFieldIdMap,
    objectMetadataItems,
    flattenedFieldMetadataItems,
    filterValueDependencies,
  ]);
};
