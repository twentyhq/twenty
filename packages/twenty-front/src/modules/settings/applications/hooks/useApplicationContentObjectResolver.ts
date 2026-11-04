import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useApplicationContentObjectResolver = (
  content: Pick<ApplicationContent, 'objects'> | undefined,
) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  return (objectUniversalIdentifier: string | null | undefined) => {
    if (!isDefined(objectUniversalIdentifier)) {
      return undefined;
    }

    const contentObject = content?.objects.find(
      (object) => object.universalIdentifier === objectUniversalIdentifier,
    );

    if (isDefined(contentObject)) {
      return { label: contentObject.label, icon: contentObject.icon };
    }

    const objectMetadataItem = objectMetadataItems.find(
      (object) => object.universalIdentifier === objectUniversalIdentifier,
    );

    return isDefined(objectMetadataItem)
      ? {
          label: objectMetadataItem.labelPlural,
          labelSingular: objectMetadataItem.labelSingular,
          icon: objectMetadataItem.icon,
        }
      : undefined;
  };
};
