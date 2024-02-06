import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { availableTableColumnKeysSelectorScopeMap } from '@/object-record/record-table/states/selectors/availableTableColumnKeysSelectorScopeMap';
import { tableColumnsStateScopeMap } from '@/object-record/record-table/states/tableColumnsStateScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

export const tableLabelIdentifierColumnSelectorScopeMap =
  createSelectorReadOnlyScopeMap({
    key: 'tableLabelIdentifierColumnSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const columns = get(tableColumnsStateScopeMap({ scopeId }));
        const objectNameSingular =
          columns[0]?.metadata.objectMetadataNameSingular || '';

        if (!objectNameSingular) return null;

        const objectMetadataItem = get(
          objectMetadataItemFamilySelector({
            objectName: objectNameSingular,
            objectNameType: 'singular',
          }),
        );

        if (!objectMetadataItem) return null;

        const availableColumnKeys = get(
          availableTableColumnKeysSelectorScopeMap({ scopeId }),
        );

        const labelIdentifierTableColumn = columns.find(
          (column) =>
            isLabelIdentifierField({
              fieldMetadataItem: {
                id: column.fieldMetadataId,
                name: column.metadata.fieldName,
              },
              objectMetadataItem,
            }) && availableColumnKeys.includes(column.fieldMetadataId),
        );

        return labelIdentifierTableColumn ?? null;
      },
  });
