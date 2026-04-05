import { JUSTUS_TRUTH_OBJECT_NAME_SINGULAR } from '@/data-validator/constants/JustusTruthObjectName.constants';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isDefined } from 'twenty-shared/utils';

export const useJustusTruthObjectExists = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const truthMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
  );

  return {
    exists: isDefined(truthMetadata),
    isLoading: objectMetadataItems.length === 0,
  };
};
