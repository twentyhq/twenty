import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';

export const getMatchingCoreRecordReferenceFields = ({
  coreRecordReferenceFields,
  objectNameSingular,
  fieldNames,
}: {
  coreRecordReferenceFields: CoreRecordReferenceField[];
  objectNameSingular: string | undefined;
  fieldNames: string[];
}) =>
  coreRecordReferenceFields.filter(
    (coreRecordReferenceField) =>
      coreRecordReferenceField.objectNameSingular === objectNameSingular &&
      fieldNames.includes(coreRecordReferenceField.fieldName),
  );
