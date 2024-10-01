import { currentObjectMetadataIdState } from '@/context-store/states/currentObjectMetadataIdState';
import { useSetRecoilState } from 'recoil';

export const useSetCurrentObjectMetadataId = () => {
  const setCurrentObjectMetadataId = useSetRecoilState(
    currentObjectMetadataIdState,
  );
  return { setCurrentObjectMetadataId };
};
