import { ALIASED_RELATION_RECORD_KEY_SEPARATOR } from 'src/engine/api/common/constants/aliased-relation-record-key-separator.constant';

export const getFieldNameFromRelationRecordKey = (relationRecordKey: string) =>
  relationRecordKey.split(ALIASED_RELATION_RECORD_KEY_SEPARATOR)[0];
