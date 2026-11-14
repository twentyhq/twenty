import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { scopeViewsByOwnerViewFieldIdMapSelector } from '@/views/states/selectors/scopeViewsByOwnerViewFieldIdMapSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';

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
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  return useMemo(
    () =>
      isColumnSettingsEnabled
        ? getScopedRelationAliases({
            recordFields: visibleRecordFields,
            fieldMetadataItemByFieldMetadataItemId,
            scopeViewsByOwnerViewFieldIdMap,
            objectMetadataItems,
            fieldMetadataItems: flattenedFieldMetadataItems,
            filterValueDependencies,
            objectPermissionsByObjectMetadataId,
          })
        : [],
    [
      isColumnSettingsEnabled,
      visibleRecordFields,
      fieldMetadataItemByFieldMetadataItemId,
      scopeViewsByOwnerViewFieldIdMap,
      objectMetadataItems,
      flattenedFieldMetadataItems,
      filterValueDependencies,
      objectPermissionsByObjectMetadataId,
    ],
  );
};
