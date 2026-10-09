import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type RecordCreationFormRequest } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export type RecordCreationFormPlacement = 'stack' | 'replace' | 'keep';

export const getRecordCreationFormPlacement = ({
  openRecordCreationFormRequest,
  openRecordCreationFormDraft,
  objectMetadataId,
}: {
  openRecordCreationFormRequest: RecordCreationFormRequest | null;
  openRecordCreationFormDraft: Partial<ObjectRecord> | null;
  objectMetadataId: string;
}): RecordCreationFormPlacement => {
  if (!isDefined(openRecordCreationFormRequest)) {
    return 'stack';
  }

  const isOpenRecordCreationFormEdited =
    isDefined(openRecordCreationFormDraft) &&
    !isDeeplyEqual(
      openRecordCreationFormDraft,
      openRecordCreationFormRequest.initialDraftRecord,
    );

  if (!isOpenRecordCreationFormEdited) {
    return 'replace';
  }

  return openRecordCreationFormRequest.objectMetadataId === objectMetadataId
    ? 'keep'
    : 'stack';
};
