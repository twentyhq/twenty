import { targetedRecordIdsState } from '@/context-store/states/targetedRecordIdsState';
import { useRecoilValue } from 'recoil';

export const useTargetedRecordIds = () => {
  const targetedRecordIds = useRecoilValue(targetedRecordIdsState);
  return { targetedRecordIds };
};
