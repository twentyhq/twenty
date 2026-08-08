import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const getObjectMetadataItemBySingularNameOrThrow = ({
  store,
  objectNameSingular,
}: {
  store: typeof jotaiStore;
  objectNameSingular: string;
}) => {
  const objectMetadataItem = store.get(
    objectMetadataItemFamilySelector.selectorFamily({
      objectName: objectNameSingular,
      objectNameType: 'singular',
    }),
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object with singular name ${objectNameSingular} not found.`,
    );
  }

  return objectMetadataItem;
};
