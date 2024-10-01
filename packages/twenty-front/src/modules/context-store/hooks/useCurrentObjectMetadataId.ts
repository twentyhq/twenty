import { currentObjectMetadataIdState } from '@/context-store/states/currentObjectMetadataIdState';
import { useRecoilValue } from 'recoil';

export const useCurrentObjectMetadataId = () => {
  const currentObjectMetadataId = useRecoilValue(currentObjectMetadataIdState);
  return { currentObjectMetadataId };
};
