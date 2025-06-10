import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { recordLoadingFamilyState } from '@/object-record/record-store/states/recordLoadingFamilyState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useRecoilState } from 'recoil';

type UseRecordShowContainerDataProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const useRecordShowContainerData = ({
  objectNameSingular,
  objectRecordId,
}: UseRecordShowContainerDataProps) => {
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const [recordLoading] = useRecoilState(
    recordLoadingFamilyState(objectRecordId),
  );

  const isPrefetchLoading = useIsPrefetchLoading();

  return {
    recordLoading,
    labelIdentifierFieldMetadataItem,
    isPrefetchLoading,
  };
};
