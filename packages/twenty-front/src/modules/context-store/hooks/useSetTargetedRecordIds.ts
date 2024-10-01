import { targetedRecordIdsState } from '@/context-store/states/targetedRecordIdsState';
import { useSetRecoilState } from 'recoil';

export const useSetTargetedRecordIds = () => {
  const setTargetedRecordIds = useSetRecoilState(targetedRecordIdsState);
  return { setTargetedRecordIds };
};
