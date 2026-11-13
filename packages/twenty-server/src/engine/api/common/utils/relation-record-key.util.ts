// GraphQL names cannot contain ':', so an aliased relation's key never collides with a field name
const ALIASED_RELATION_RECORD_KEY_SEPARATOR = '::';

export const computeRelationRecordKey = ({
  fieldName,
  responseKey,
}: {
  fieldName: string;
  responseKey: string;
}) =>
  responseKey === fieldName
    ? fieldName
    : `${fieldName}${ALIASED_RELATION_RECORD_KEY_SEPARATOR}${responseKey}`;

export const getFieldNameFromRelationRecordKey = (relationRecordKey: string) =>
  relationRecordKey.split(ALIASED_RELATION_RECORD_KEY_SEPARATOR)[0];

export const getAliasedRelationRecordKeys = (
  record: Record<string, unknown>,
  fieldName: string,
) =>
  Object.keys(record).filter((key) =>
    key.startsWith(`${fieldName}${ALIASED_RELATION_RECORD_KEY_SEPARATOR}`),
  );
