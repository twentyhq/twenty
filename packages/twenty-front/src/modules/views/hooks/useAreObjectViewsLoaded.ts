import { loadedViewsObjectMetadataIdsState } from '@/metadata-store/states/loadedViewsObjectMetadataIdsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEnsureObjectViewsLoaded } from '@/views/hooks/useEnsureObjectViewsLoaded';
import { isDefined } from 'twenty-shared/utils';

export const useAreObjectViewsLoaded = (
  objectMetadataId: string | null | undefined,
) => {
  const loadedViewsObjectMetadataIds = useAtomStateValue(
    loadedViewsObjectMetadataIdsState,
  );

  useEnsureObjectViewsLoaded([objectMetadataId]);

  return (
    isDefined(objectMetadataId) &&
    loadedViewsObjectMetadataIds.includes(objectMetadataId)
  );
};
