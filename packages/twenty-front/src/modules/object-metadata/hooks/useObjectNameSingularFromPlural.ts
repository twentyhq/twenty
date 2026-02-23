import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useObjectNameSingularFromPlural = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const objectMetadataItem = useFamilySelectorValueV2(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNamePlural,
      objectNameType: 'plural',
    },
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item not found for ${objectNamePlural} object`,
    );
  }

  return { objectNameSingular: objectMetadataItem.nameSingular };
};
