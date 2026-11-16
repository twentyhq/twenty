import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { resolveApplicationContentObject } from '@/settings/applications/utils/resolveApplicationContentObject';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useApplicationContentObjectResolver = (
  content: Pick<ApplicationContent, 'objects'> | undefined,
) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  return (objectUniversalIdentifier: string | null | undefined) =>
    resolveApplicationContentObject({
      objectUniversalIdentifier,
      objectMetadataItems,
      contentObjects: content?.objects ?? [],
    });
};
