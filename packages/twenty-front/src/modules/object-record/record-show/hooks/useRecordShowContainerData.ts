import { recordLoadingFamilyState } from '@/object-record/record-store/states/recordLoadingFamilyState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type UseRecordShowContainerDataProps = {
  objectRecordId: string;
};

export const useRecordShowContainerData = ({
  objectRecordId,
}: UseRecordShowContainerDataProps) => {
  const recordLoading = useAtomFamilyStateValue(
    recordLoadingFamilyState,
    objectRecordId,
  );

  const isPrefetchLoading = useIsPrefetchLoading();

  return {
    recordLoading,
    isPrefetchLoading,
  };
};
