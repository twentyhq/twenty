import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { VIEW_STACK_ENABLED_OBJECT_NAME_SINGULARS } from '@/views/view-stack/constants/ViewStackEnabledObjectNameSingulars';

export const useAreViewStacksEnabled = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  return {
    areViewStacksEnabled: VIEW_STACK_ENABLED_OBJECT_NAME_SINGULARS.includes(
      objectMetadataItem.nameSingular,
    ),
  };
};
