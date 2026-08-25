import { isObjectWithId } from '@/object-record/record-field/ui/utils/junction/isObjectWithId';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getRelatedRecordFromJunction = <
  TRecord extends { id: string } = ObjectRecord,
>(
  junctionRecord: object,
  relationFieldName: string,
): TRecord | undefined => {
  const relatedRecord = (junctionRecord as Record<string, unknown>)[
    relationFieldName
  ];

  if (!isObjectWithId(relatedRecord)) {
    return undefined;
  }

  return relatedRecord as TRecord;
};
