import { createState } from 'twenty-ui';
import { useSetRecoilState, useRecoilValue } from 'recoil';
const previewRecordIdState = createState<string | null>({
  key: 'previewRecordId',
  defaultValue: null,
});

export const usePreviewRecordId = () => {
  const previewRecordId = useRecoilValue(previewRecordIdState);
  return previewRecordId;
};
export const useSetPreviewRecordId = () => {
  const setPreviewRecordId = useSetRecoilState(previewRecordIdState);
  return setPreviewRecordId;
};
