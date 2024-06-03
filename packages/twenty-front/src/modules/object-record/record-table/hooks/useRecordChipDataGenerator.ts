import { useMemo } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { getAvatarUrl } from '@/object-metadata/utils/getAvatarUrl';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { RecordChipData } from '@/object-record/record-field/types/RecordChipData';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const useRecordChipDataGenerator = ({
  objectNameSingular,
  visibleTableColumns,
}: {
  objectNameSingular: string;
  visibleTableColumns: ColumnDefinition<FieldMetadata>[];
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  return useMemo(() => {
    return Object.fromEntries<(record: ObjectRecord) => RecordChipData>(
      visibleTableColumns
        .filter(
          (tableColumn) =>
            tableColumn.isLabelIdentifier ||
            tableColumn.type === FieldMetadataType.Relation,
        )
        .map((tableColumn) => {
          const objectNameSingularToFind = tableColumn.isLabelIdentifier
            ? objectNameSingular
            : isFieldRelation(tableColumn)
              ? tableColumn.metadata.relationObjectMetadataNameSingular
              : undefined;

          const objectMetadataItem = objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular === objectNameSingularToFind,
          );

          if (
            !isDefined(objectMetadataItem) ||
            !isDefined(objectNameSingularToFind)
          ) {
            return ['', () => ({}) as any];
          }

          const labelIdentifierFieldMetadataItem =
            getLabelIdentifierFieldMetadataItem(objectMetadataItem);

          const imageIdentifierFieldMetadata = objectMetadataItem.fields.find(
            (field) =>
              field.id === objectMetadataItem.imageIdentifierFieldMetadataId,
          );

          const avatarType = getAvatarType(objectNameSingularToFind);

          return [
            tableColumn.metadata.fieldName,
            (record: ObjectRecord) => ({
              name: getLabelIdentifierFieldValue(
                record,
                labelIdentifierFieldMetadataItem,
                objectMetadataItem.nameSingular,
              ),
              avatarUrl: getAvatarUrl(
                objectMetadataItem.nameSingular,
                record,
                imageIdentifierFieldMetadata,
              ),
              avatarType,
              linkToShowPage: getLinkToShowPage(
                objectMetadataItem.nameSingular,
                record,
              ),
            }),
          ];
        }),
    );
  }, [objectNameSingular, visibleTableColumns, objectMetadataItems]);
};
