import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { objectMetadataItemByUniversalIdentifierFamilySelector } from '@/object-metadata/states/objectMetadataItemByUniversalIdentifierFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useObjectMetadataItemByUniversalIdentifier = ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}) => {
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemByUniversalIdentifierFamilySelector,
    universalIdentifier,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new CustomError(
      doNotTranslate(
        `Object metadata item not found for universal identifier ${universalIdentifier}`,
      ),
      'OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }

  return { objectMetadataItem };
};
