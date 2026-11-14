import { ALIASED_RELATION_RECORD_KEY_SEPARATOR } from 'src/engine/api/common/constants/aliased-relation-record-key-separator.constant';

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
