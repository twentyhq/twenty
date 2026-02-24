import { recordLoadingFamilyState } from '@/object-record/record-store/states/recordLoadingFamilyState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';

type UseRecordShowContainerDataProps = {
  objectRecordId: string;
};

export const useRecordShowContainerData = ({
  objectRecordId,
}: UseRecordShowContainerDataProps) => {
  const recordLoading = useFamilyAtomValue(
    recordLoadingFamilyState,
    objectRecordId,
  );

  const isPrefetchLoading = useIsPrefetchLoading();

  return {
    recordLoading,
    isPrefetchLoading,
  };
};
