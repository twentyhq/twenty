import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useObjectNameSingularFromPlural = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNamePlural,
      objectNameType: 'plural',
    },
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      doNotTranslate(
        `Object metadata item not found for ${objectNamePlural} object`,
      ),
    );
  }

  return { objectNameSingular: objectMetadataItem.nameSingular };
};
