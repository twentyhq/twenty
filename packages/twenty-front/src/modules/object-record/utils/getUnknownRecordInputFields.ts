import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataFromGqlField } from '@/object-record/cache/utils/getFieldMetadataFromGqlField';
import { GRAPHQL_TYPENAME_KEY } from '@/object-record/constants/GraphqlTypenameKey';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getUnknownRecordInputFields = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
}): string[] => {
  return Object.keys(recordInput).filter((recordKey) => {
    const correspondingFieldMetadataItem = objectMetadataItem.fields.find(
      (field) => field.name === recordKey,
    );

    const potentialRelationJoinColumnNameFieldMetadataItem =
      objectMetadataItem.fields.find(
        (field) =>
          field.type === FieldMetadataType.RELATION &&
          computeRelationGqlFieldJoinColumnName({ name: field.name }) ===
            recordKey,
      );

    const potentialMorphRelationJoinColumnNameFieldMetadataItem =
      objectMetadataItem.fields.find((field) => {
        if (!isFieldMorphRelation(field)) return false;

        return isDefined(
          getFieldMetadataFromGqlField({
            objectMetadataItem,
            gqlField: recordKey,
          }),
        );
      });

    const isUnknownField =
      !isDefined(correspondingFieldMetadataItem) &&
      !isDefined(potentialRelationJoinColumnNameFieldMetadataItem) &&
      !isDefined(potentialMorphRelationJoinColumnNameFieldMetadataItem);

    const isTypenameField = recordKey === GRAPHQL_TYPENAME_KEY;

    return isUnknownField && !isTypenameField;
  });
};
