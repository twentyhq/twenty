import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const useObjectNameSingularFromPlural = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const objectMetadataItem = useFamilySelectorValue(
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
