import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';

import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { getReadRestrictedFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getReadRestrictedFieldMetadataIdsFromObjectPermissions';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';
import { formatFieldMetadataItemAsColumnDefinition } from '../utils/formatFieldMetadataItemAsColumnDefinition';

export const useColumnDefinitionsFromFieldMetadata = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  const activeFieldMetadataItems = objectMetadataItem.fields.filter(
    ({ isActive, isSystem }) => isActive && !isSystem,
  );

  const filterableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const sortableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForSortFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  let restrictedFieldMetadataIds: string[] = [];

  const featureFlags = useFeatureFlagsMap();
  const isFieldsPermissionsEnabled =
    featureFlags[FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED];

  if (isFieldsPermissionsEnabled) {
    restrictedFieldMetadataIds =
      getReadRestrictedFieldMetadataIdsFromObjectPermissions({
        objectPermissions: [
          objectPermissionsByObjectMetadataId[objectMetadataItem.id],
        ],
        objectMetadataId: objectMetadataItem.id,
      });
  }

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
    activeFieldMetadataItems
      .map((field, index) =>
        formatFieldMetadataItemAsColumnDefinition({
          position: index,
          field,
          objectMetadataItem,
        }),
      )
      .filter(filterAvailableTableColumns)
      .filter((column) => {
        return !restrictedFieldMetadataIds.includes(column.fieldMetadataId);
      })
      .map((column) => {
        const existsInFilterDefinitions = filterableFieldMetadataItems.some(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === column.fieldMetadataId,
        );

        const existsInSortDefinitions = sortableFieldMetadataItems.some(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === column.fieldMetadataId,
        );
        return {
          ...column,
          isFilterable: existsInFilterDefinitions,
          isSortable: existsInSortDefinitions,
        };
      });

  return {
    columnDefinitions,
  };
};
