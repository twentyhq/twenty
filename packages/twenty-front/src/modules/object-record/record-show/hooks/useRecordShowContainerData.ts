import { recordLoadingFamilyState } from '@/object-record/record-store/states/recordLoadingFamilyState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';

type UseRecordShowContainerDataProps = {
  objectRecordId: string;
};

export const useRecordShowContainerData = ({
  objectRecordId,
}: UseRecordShowContainerDataProps) => {
  const recordLoading = useFamilyRecoilValueV2(
    recordLoadingFamilyState,
    objectRecordId,
  );

  const isPrefetchLoading = useIsPrefetchLoading();

  return {
    recordLoading,
    isPrefetchLoading,
  };
};
