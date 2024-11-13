import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { recordLoadingFamilyState } from '@/object-record/record-store/states/recordLoadingFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierSelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useRecoilState, useRecoilValue } from 'recoil';

type UseRecordShowContainerDataProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const useRecordShowContainerData = ({
  objectNameSingular,
  objectRecordId,
}: UseRecordShowContainerDataProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const [recordLoading] = useRecoilState(
    recordLoadingFamilyState(objectRecordId),
  );

  const [recordFromStore] = useRecoilState<ObjectRecord | null>(
    recordStoreFamilyState(objectRecordId),
  );

  const recordIdentifier = useRecoilValue(
    recordStoreIdentifierFamilySelector({
      objectNameSingular,
      recordId: objectRecordId,
    }),
  );

  const isPrefetchLoading = useIsPrefetchLoading();

  const { objectMetadataItems } = useObjectMetadataItems();

  return {
    recordFromStore,
    recordLoading,
    objectMetadataItem,
    labelIdentifierFieldMetadataItem,
    isPrefetchLoading,
    recordIdentifier,
    objectMetadataItems,
  };
};
