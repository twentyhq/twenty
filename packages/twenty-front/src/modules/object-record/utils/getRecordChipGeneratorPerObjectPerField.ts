import { ChipGeneratorPerObjectPerField } from '@/object-metadata/context/PreComputedChipGeneratorsContext';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { getAvatarUrl } from '@/object-metadata/utils/getAvatarUrl';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-record/record-field/types/guards/isFieldNumber';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordChipData } from '@/object-record/record-field/types/RecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const isFieldChipDisplay = (
  field: Pick<FieldMetadataItem, 'type'>,
  isLabelIdentifier: boolean,
) =>
  isLabelIdentifier &&
  (isFieldText(field) || isFieldFullName(field) || isFieldNumber(field));

export const getRecordChipGeneratorPerObjectPerField = (
  objectMetadataItems: ObjectMetadataItem[],
) => {
  const recordChipGeneratorPerObjectPerField: ChipGeneratorPerObjectPerField =
    {};

  for (const objectMetadataItem of objectMetadataItems) {
    const generatorPerField = Object.fromEntries<
      (record: ObjectRecord) => RecordChipData
    >(
      objectMetadataItem.fields
        .filter(
          (fieldMetadataItem) =>
            isLabelIdentifierField({
              fieldMetadataItem: fieldMetadataItem,
              objectMetadataItem,
            }) ||
            fieldMetadataItem.type === FieldMetadataType.Relation ||
            isFieldChipDisplay(
              fieldMetadataItem,
              isLabelIdentifierField({
                fieldMetadataItem: fieldMetadataItem,
                objectMetadataItem,
              }),
            ),
        )
        .map((fieldMetadataItem) => {
          const objectNameSingularToFind = isLabelIdentifierField({
            fieldMetadataItem: fieldMetadataItem,
            objectMetadataItem: objectMetadataItem,
          })
            ? objectMetadataItem.nameSingular
            : isFieldRelation(fieldMetadataItem)
              ? fieldMetadataItem.relationDefinition?.targetObjectMetadata
                  .nameSingular ?? undefined
              : undefined;

          const objectMetadataItemToUse = objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular === objectNameSingularToFind,
          );

          if (
            !isDefined(objectMetadataItemToUse) ||
            !isDefined(objectNameSingularToFind)
          ) {
            return ['', () => ({}) as any];
          }

          const labelIdentifierFieldMetadataItem =
            getLabelIdentifierFieldMetadataItem(objectMetadataItemToUse);

          const imageIdentifierFieldMetadata =
            objectMetadataItemToUse.fields.find(
              (field) =>
                field.id ===
                objectMetadataItemToUse.imageIdentifierFieldMetadataId,
            );

          const avatarType = getAvatarType(objectNameSingularToFind);

          return [
            fieldMetadataItem.name,
            (record: ObjectRecord) => ({
              recordId: record.id,
              name: getLabelIdentifierFieldValue(
                record,
                labelIdentifierFieldMetadataItem,
                objectMetadataItemToUse.nameSingular,
              ),
              avatarUrl: getAvatarUrl(
                objectMetadataItemToUse.nameSingular,
                record,
                imageIdentifierFieldMetadata,
              ),
              avatarType,
              linkToShowPage: getLinkToShowPage(
                objectMetadataItemToUse.nameSingular,
                record,
              ),
            }),
          ];
        }),
    );

    recordChipGeneratorPerObjectPerField[objectMetadataItem.nameSingular] =
      generatorPerField;
  }

  return recordChipGeneratorPerObjectPerField;
};
