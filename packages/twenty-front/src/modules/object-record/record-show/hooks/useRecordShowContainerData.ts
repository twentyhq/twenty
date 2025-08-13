import { recordLoadingFamilyState } from '@/object-record/record-store/states/recordLoadingFamilyState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useRecoilState } from 'recoil';

type UseRecordShowContainerDataProps = {
  objectRecordId: string;
};

export const useRecordShowContainerData = ({
  objectRecordId,
}: UseRecordShowContainerDataProps) => {
  const [recordLoading] = useRecoilState(
    recordLoadingFamilyState(objectRecordId),
  );

  const isPrefetchLoading = useIsPrefetchLoading();

  return {
    recordLoading,
    isPrefetchLoading,
  };
};
