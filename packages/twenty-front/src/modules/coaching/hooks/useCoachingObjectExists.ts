import { COACHING_OBJECT_NAME_SINGULAR } from '@/coaching/constants/CoachingObjectNameSingular.constants';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isDefined } from 'twenty-shared/utils';

export const useCoachingObjectExists = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const customerMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === COACHING_OBJECT_NAME_SINGULAR,
  );

  return {
    exists: isDefined(customerMetadata),
    isLoading: objectMetadataItems.length === 0,
  };
};
