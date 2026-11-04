import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
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

    const objectMetadataItem = objectMetadataItems.find(
      (object) => object.universalIdentifier === objectUniversalIdentifier,
    );

    if (isDefined(objectMetadataItem)) {
      return {
        universalIdentifier: objectUniversalIdentifier,
        label: objectMetadataItem.labelPlural,
        labelSingular: objectMetadataItem.labelSingular,
        icon: objectMetadataItem.icon,
        color: getObjectColorWithFallback(objectMetadataItem),
        colorSource: objectMetadataItem,
      };
    }

    // Objects of a marketplace app that is not installed only exist in its content
    const contentObject = content?.objects.find(
      (object) => object.universalIdentifier === objectUniversalIdentifier,
    );

    return isDefined(contentObject)
      ? {
          universalIdentifier: objectUniversalIdentifier,
          label: contentObject.label,
          labelSingular: undefined,
          icon: contentObject.icon,
          color: getObjectColorWithFallback({
            color: contentObject.color,
            isSystem: false,
          }),
          colorSource: {
            color: contentObject.color,
            isSystem: false,
            nameSingular: '',
          },
        }
      : undefined;
  };
};
