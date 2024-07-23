import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { usePreviewRecordId } from '@/settings/data-model/fields/preview/hooks/previewRecordIdHooks';
import { useRecoilValue } from 'recoil';

export const useUpsertedPreviewRecord = () => {
  const previewRecordId = usePreviewRecordId();
  const upsertedPreviewRecord = useRecoilValue(
    recordStoreFamilyState(previewRecordId ?? ''),
  );
  return upsertedPreviewRecord;
};
