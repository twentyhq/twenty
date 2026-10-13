import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';

export const getMatchingRecordFieldDisplayOverrides = ({
  recordFieldDisplayOverrides,
  objectNameSingular,
  fieldNames,
}: {
  recordFieldDisplayOverrides: RecordFieldDisplayOverride[];
  objectNameSingular: string | undefined;
  fieldNames: string[];
}) =>
  recordFieldDisplayOverrides.filter(
    (recordFieldDisplayOverride) =>
      recordFieldDisplayOverride.objectNameSingular === objectNameSingular &&
      fieldNames.includes(recordFieldDisplayOverride.fieldName),
  );
