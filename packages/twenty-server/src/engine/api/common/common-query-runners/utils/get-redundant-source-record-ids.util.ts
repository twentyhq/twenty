import isEqual from 'lodash.isequal';
import { type ObjectLiteral } from 'typeorm';

// Values the database derives per row rather than per interaction. searchVector matters most:
// it is built from the record id, so leaving it in made every comparison unequal and nothing
// was ever recognised as redundant. Attribution is deliberately not in here, so a differing
// createdBy still keeps both rows.
const GENERATED_PERSON_RELATION_FIELD_NAMES = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'position',
  'searchVector',
]);

const getComparableRecord = (
  record: ObjectLiteral,
  personRelationIdFieldName: string,
): ObjectLiteral =>
  Object.fromEntries(
    Object.entries(record).filter(
      ([fieldName]) =>
        !GENERATED_PERSON_RELATION_FIELD_NAMES.has(fieldName) &&
        fieldName !== personRelationIdFieldName,
    ),
  );

export const getRedundantSourceRecordIds = ({
  records,
  sourcePersonIds,
  survivorPersonId,
  personRelationIdFieldName,
  canBeDeduplicated = () => true,
}: {
  records: ObjectLiteral[];
  sourcePersonIds: string[];
  survivorPersonId: string;
  personRelationIdFieldName: string;
  canBeDeduplicated?: (record: ObjectLiteral) => boolean;
}): string[] => {
  const sourcePersonIdSet = new Set(sourcePersonIds);
  const survivorRecords = records.filter(
    (record) =>
      record[personRelationIdFieldName] === survivorPersonId &&
      canBeDeduplicated(record),
  );

  return records
    .filter(
      (record) =>
        sourcePersonIdSet.has(record[personRelationIdFieldName]) &&
        canBeDeduplicated(record),
    )
    .filter((sourceRecord) =>
      survivorRecords.some((survivorRecord) =>
        isEqual(
          getComparableRecord(sourceRecord, personRelationIdFieldName),
          getComparableRecord(survivorRecord, personRelationIdFieldName),
        ),
      ),
    )
    .map((record) => record.id);
};
