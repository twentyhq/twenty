import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isDefined } from 'twenty-shared/utils';

export const useCoatObjectExists = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const contractMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === COAT_OBJECT_NAME_SINGULAR,
  );

  return {
    exists: isDefined(contractMetadata),
    isLoading: objectMetadataItems.length === 0,
  };
};
