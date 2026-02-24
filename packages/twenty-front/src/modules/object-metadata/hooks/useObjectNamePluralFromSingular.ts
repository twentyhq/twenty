import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const useObjectNamePluralFromSingular = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const objectMetadataItem = useFamilySelectorValue(
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
