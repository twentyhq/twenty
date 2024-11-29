import {
  ChipGeneratorPerObjectNameSingularPerFieldName,
  IdentifierChipGeneratorPerObject,
} from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { getAvatarUrl } from '@/object-metadata/utils/getAvatarUrl';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { isFieldIdentifierDisplay } from '@/object-record/record-field/meta-types/display/utils/isFieldIdentifierDisplay';
import { RecordChipData } from '@/object-record/record-field/types/RecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const getRecordChipGenerators = (
  objectMetadataItems: ObjectMetadataItem[],
) => {
  const chipGeneratorPerObjectPerField: ChipGeneratorPerObjectNameSingularPerFieldName =
    {};

  const identifierChipGeneratorPerObject: IdentifierChipGeneratorPerObject = {};

  for (const objectMetadataItem of objectMetadataItems) {
    const labelIdentifierFieldMetadataItem =
      getLabelIdentifierFieldMetadataItem(objectMetadataItem);

    const generatorPerField = Object.fromEntries<
      (record: ObjectRecord) => RecordChipData
    >(
      objectMetadataItem.fields
        .filter(
          (fieldMetadataItem) =>
            labelIdentifierFieldMetadataItem?.id === fieldMetadataItem.id ||
            fieldMetadataItem.type === FieldMetadataType.Relation ||
            isFieldIdentifierDisplay(
              fieldMetadataItem,
              isLabelIdentifierField({
                fieldMetadataItem: fieldMetadataItem,
                objectMetadataItem,
              }),
            ),
        )
        .map((fieldMetadataItem) => {
          const isLabelIdentifier =
            labelIdentifierFieldMetadataItem?.id === fieldMetadataItem.id;

          const currentObjectNameSingular = objectMetadataItem.nameSingular;
          const fieldObjectNameSingular =
            fieldMetadataItem.relationDefinition?.targetObjectMetadata
              .nameSingular ?? undefined;

          const objectNameSingularToFind = isLabelIdentifier
            ? currentObjectNameSingular
            : fieldObjectNameSingular;

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

          const labelIdentifierFieldMetadataItemToUse =
            getLabelIdentifierFieldMetadataItem(objectMetadataItemToUse);

          const imageIdentifierFieldMetadataToUse =
            objectMetadataItemToUse.fields.find(
              (field) =>
                field.id ===
                objectMetadataItemToUse.imageIdentifierFieldMetadataId,
            );

          const avatarType = getAvatarType(objectNameSingularToFind);

          return [
            fieldMetadataItem.name,
            (record: ObjectRecord) =>
              ({
                recordId: record.id,
                name: getLabelIdentifierFieldValue(
                  record,
                  labelIdentifierFieldMetadataItemToUse,
                  objectMetadataItemToUse.nameSingular,
                ),
                avatarUrl: getAvatarUrl(
                  objectMetadataItemToUse.nameSingular,
                  record,
                  imageIdentifierFieldMetadataToUse,
                ),
                avatarType,
                isLabelIdentifier,
                objectNameSingular: objectNameSingularToFind,
              }) satisfies RecordChipData,
          ];
        }),
    );

    chipGeneratorPerObjectPerField[objectMetadataItem.nameSingular] =
      generatorPerField;

    if (isDefined(labelIdentifierFieldMetadataItem)) {
      identifierChipGeneratorPerObject[objectMetadataItem.nameSingular] =
        chipGeneratorPerObjectPerField[objectMetadataItem.nameSingular]?.[
          labelIdentifierFieldMetadataItem.name
        ];
    }
  }

  return {
    chipGeneratorPerObjectPerField,
    identifierChipGeneratorPerObject,
  };
};
