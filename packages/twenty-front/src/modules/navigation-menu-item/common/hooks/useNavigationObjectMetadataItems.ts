import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationObjectMetadataItems = () =>
  useAtomStateValue(objectMetadataItemsSelector);
