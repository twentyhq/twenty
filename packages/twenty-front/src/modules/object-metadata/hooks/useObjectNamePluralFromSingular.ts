import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useObjectNamePluralFromSingular = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const objectMetadataItem = useFamilySelectorValueV2(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNameSingular,
      objectNameType: 'singular',
    },
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item not found for ${objectNameSingular} object`,
    );
  }

  return { objectNamePlural: objectMetadataItem.namePlural };
};
