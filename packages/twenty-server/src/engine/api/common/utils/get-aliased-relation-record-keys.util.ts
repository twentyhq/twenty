import { ALIASED_RELATION_RECORD_KEY_SEPARATOR } from 'src/engine/api/common/constants/aliased-relation-record-key-separator.constant';

export const getAliasedRelationRecordKeys = ({
  record,
  fieldName,
}: {
  record: Record<string, unknown>;
  fieldName: string;
}) =>
  Object.keys(record).filter((key) =>
    key.startsWith(`${fieldName}${ALIASED_RELATION_RECORD_KEY_SEPARATOR}`),
  );
