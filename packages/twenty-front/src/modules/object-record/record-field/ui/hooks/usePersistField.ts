import { useRecoilCallback } from 'recoil';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldMorphRelationMetadata,
  type FieldRelationMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldAddressValue } from '@/object-record/record-field/ui/types/guards/isFieldAddressValue';
import { isFieldDate } from '@/object-record/record-field/ui/types/guards/isFieldDate';
import { isFieldDateValue } from '@/object-record/record-field/ui/types/guards/isFieldDateValue';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldMultiSelectValue } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelectValue';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/ui/types/guards/isFieldPhonesValue';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { isFieldRawJsonValue } from '@/object-record/record-field/ui/types/guards/isFieldRawJsonValue';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { isFieldSelectValue } from '@/object-record/record-field/ui/types/guards/isFieldSelectValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { isFieldArrayValue } from '@/object-record/record-field/ui/types/guards/isFieldArrayValue';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationManyToOneValue } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOneValue';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';
import { isFieldRichTextV2 } from '@/object-record/record-field/ui/types/guards/isFieldRichTextV2';
import { isFieldRichTextValue } from '@/object-record/record-field/ui/types/guards/isFieldRichTextValue';
import { isFieldRichTextV2Value } from '@/object-record/record-field/ui/types/guards/isFieldRichTextValueV2';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '@/object-record/record-field/ui/types/guards/isFieldBooleanValue';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { isFieldDateTimeValue } from '@/object-record/record-field/ui/types/guards/isFieldDateTimeValue';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldNumberValue } from '@/object-record/record-field/ui/types/guards/isFieldNumberValue';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';
import { isFieldRatingValue } from '@/object-record/record-field/ui/types/guards/isFieldRatingValue';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';

export const usePersistField = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const persistField = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
        recordId,
        fieldDefinition,
        valueToPersist,
      }: {
        recordId: string;
        fieldDefinition: FieldDefinition<FieldMetadata>;
        valueToPersist: unknown;
      }) => {
        const fieldIsRelationManyToOne =
          isFieldRelationManyToOne(
            fieldDefinition as FieldDefinition<FieldRelationMetadata>,
          ) && isFieldRelationManyToOneValue(valueToPersist);

        const fieldIsMorphRelationManyToOne =
          isFieldMorphRelationManyToOne(
            fieldDefinition as FieldDefinition<FieldMorphRelationMetadata>,
          ) && isFieldRelationManyToOneValue(valueToPersist);

        const fieldIsText =
          isFieldText(fieldDefinition) && isFieldTextValue(valueToPersist);

        const fieldIsEmails =
          isFieldEmails(fieldDefinition) && isFieldEmailsValue(valueToPersist);

        const fieldIsDateTime =
          isFieldDateTime(fieldDefinition) &&
          isFieldDateTimeValue(valueToPersist);

        const fieldIsDate =
          isFieldDate(fieldDefinition) && isFieldDateValue(valueToPersist);

        const fieldIsLinks =
          isFieldLinks(fieldDefinition) && isFieldLinksValue(valueToPersist);

        const fieldIsBoolean =
          isFieldBoolean(fieldDefinition) &&
          isFieldBooleanValue(valueToPersist);

        const fieldIsRating =
          isFieldRating(fieldDefinition) && isFieldRatingValue(valueToPersist);

        const fieldIsNumber =
          isFieldNumber(fieldDefinition) && isFieldNumberValue(valueToPersist);

        const fieldIsCurrency =
          isFieldCurrency(fieldDefinition) &&
          isFieldCurrencyValue(valueToPersist);

        const fieldIsFullName =
          isFieldFullName(fieldDefinition) &&
          isFieldFullNameValue(valueToPersist);

        const fieldIsPhones =
          isFieldPhones(fieldDefinition) && isFieldPhonesValue(valueToPersist);

        const fieldIsSelect =
          isFieldSelect(fieldDefinition) && isFieldSelectValue(valueToPersist);

        const fieldIsMultiSelect =
          isFieldMultiSelect(fieldDefinition) &&
          isFieldMultiSelectValue(valueToPersist);

        const fieldIsAddress =
          isFieldAddress(fieldDefinition) &&
          isFieldAddressValue(valueToPersist);

        const fieldIsRawJson =
          isFieldRawJson(fieldDefinition) &&
          isFieldRawJsonValue(valueToPersist);

        const fieldIsRichText =
          isFieldRichText(fieldDefinition) &&
          isFieldRichTextValue(valueToPersist);

        const fieldIsRichTextV2 =
          isFieldRichTextV2(fieldDefinition) &&
          isFieldRichTextV2Value(valueToPersist);

        const fieldIsArray =
          isFieldArray(fieldDefinition) && isFieldArrayValue(valueToPersist);

        const fieldIsUIReadOnly =
          fieldDefinition.metadata.isUIReadOnly ?? false;

        if (fieldIsRawJson && fieldIsUIReadOnly) {
          return;
        }

        const isValuePersistable =
          fieldIsMorphRelationManyToOne ||
          fieldIsRelationManyToOne ||
          fieldIsText ||
          fieldIsBoolean ||
          fieldIsEmails ||
          fieldIsRating ||
          fieldIsNumber ||
          fieldIsDateTime ||
          fieldIsDate ||
          fieldIsPhones ||
          fieldIsLinks ||
          fieldIsCurrency ||
          fieldIsFullName ||
          fieldIsSelect ||
          fieldIsMultiSelect ||
          fieldIsAddress ||
          fieldIsRawJson ||
          fieldIsArray ||
          fieldIsRichText ||
          fieldIsRichTextV2;

        if (isValuePersistable) {
          const fieldName = fieldDefinition.metadata.fieldName;

          const currentValue: any = snapshot
            .getLoadable(recordStoreFamilySelector({ recordId, fieldName }))
            .getValue();

          if (fieldIsRelationManyToOne) {
            if (valueToPersist?.id === currentValue?.id) {
              return;
            }

            const newRecord = await updateOneRecord?.({
              idToUpdate: recordId,
              updateOneRecordInput: {
                [getForeignKeyNameFromRelationFieldName(fieldName)]:
                  valueToPersist?.id ?? null,
              },
            });

            upsertRecordsInStore({
              partialRecords: [
                getRecordFromRecordNode({
                  recordNode: newRecord,
                }),
              ],
              recordGqlFields: {
                [getForeignKeyNameFromRelationFieldName(fieldName)]: true,
              },
            });
            return;
          }

          if (fieldIsMorphRelationManyToOne) {
            if (valueToPersist?.id === currentValue?.id) {
              return;
            }

            const newRecord = await updateOneRecord?.({
              idToUpdate: recordId,
              updateOneRecordInput: {
                [getForeignKeyNameFromRelationFieldName(fieldName)]:
                  valueToPersist?.id ?? null,
              },
            });

            upsertRecordsInStore({
              partialRecords: [
                getRecordFromRecordNode({
                  recordNode: newRecord,
                }),
              ],
            });
            return;
          }

          if (isDeeplyEqual(valueToPersist, currentValue)) {
            return;
          }

          updateOneRecord?.({
            idToUpdate: recordId,
            updateOneRecordInput: {
              [fieldName]: valueToPersist,
            },
          });
          set(
            recordStoreFamilySelector({ recordId, fieldName }),
            valueToPersist,
          );
        } else {
          throw new Error(
            `Invalid value to persist: ${JSON.stringify(
              valueToPersist,
            )} for type : ${
              fieldDefinition.type
            }, type may not be implemented in usePersistField.`,
          );
        }
      },
    [updateOneRecord, upsertRecordsInStore],
  );

  return persistField;
};
