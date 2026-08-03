import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useParams } from 'react-router-dom';

// The record index route carries objectNamePlural, but record show pages, the
// side panel and the command menu do not, so resolve it from the field's own
// object metadata and only fall back to the URL.
export const useObjectNamePluralForSelectOption = (
  objectMetadataNameSingular?: string,
) => {
  const { objectNamePlural: objectNamePluralFromUrl } = useParams();

  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectMetadataNameSingular ?? '',
      objectNameType: 'singular',
    },
  );

  return {
    objectNamePlural: objectMetadataItem?.namePlural ?? objectNamePluralFromUrl,
  };
};
