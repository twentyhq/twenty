import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordPageLayoutObjectApplicationId = (): {
  objectApplicationId: string | undefined;
} => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataId = currentPageLayout.objectMetadataId;

  if (!isDefined(objectMetadataId)) {
    return { objectApplicationId: undefined };
  }

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === objectMetadataId,
  );

  return {
    objectApplicationId: objectMetadataItem?.applicationId,
  };
};
