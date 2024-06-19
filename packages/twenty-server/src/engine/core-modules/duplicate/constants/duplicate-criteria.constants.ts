import { RecordDuplicateCriteria } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

/**
 * objectName: directly reference the name of the object from the metadata tables.
 * columnNames: reference the column names not the field names.
 * So if we need to reference a custom field, we should directly add the column name like `_customColumn`.
 * If we need to terence a composite field, we should add all children of the composite like `nameFirstName` and `nameLastName`
 */
export const DUPLICATE_CRITERIA_COLLECTION: RecordDuplicateCriteria[] = [
  {
    objectName: 'company',
    columnNames: ['domainName'],
    useAsUniqueKeyForUpsert: true,
  },
  {
    objectName: 'company',
    columnNames: ['name'],
    useAsUniqueKeyForUpsert: true,
  },
  {
    objectName: 'person',
    columnNames: ['nameFirstName', 'nameLastName'],
    useAsUniqueKeyForUpsert: false,
  },
  {
    objectName: 'person',
    columnNames: ['linkedinLinkUrl'],
    useAsUniqueKeyForUpsert: false,
  },
  {
    objectName: 'person',
    columnNames: ['email'],
    useAsUniqueKeyForUpsert: true,
  },
];
