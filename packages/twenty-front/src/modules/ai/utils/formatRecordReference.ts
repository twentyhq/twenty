import { RECORD_REFERENCE_CLOSE_TAG } from '@/ai/constants/RecordReferenceCloseTag';

export const formatRecordReference = ({
  objectNameSingular,
  recordId,
  displayName,
}: {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
}): string =>
  `[[record:${objectNameSingular}:${recordId}:${displayName}${RECORD_REFERENCE_CLOSE_TAG}`;
