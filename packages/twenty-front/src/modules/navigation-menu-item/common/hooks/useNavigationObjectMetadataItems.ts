import { CoreObjectNameSingular } from 'twenty-shared/types';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationObjectMetadataItems = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  return objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular !==
      CoreObjectNameSingular.WorkflowVersion,
  );
};
