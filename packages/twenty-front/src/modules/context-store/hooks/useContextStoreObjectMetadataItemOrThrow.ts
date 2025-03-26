import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useContextStoreObjectMetadataItemOrThrow = (
  contextStoreInstanceId?: string,
) => {
  const objectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    contextStoreInstanceId,
  );

  const isSettingsPage = useIsSettingsPage();

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId ?? '',
  });

  if (!objectMetadataItem && !isSettingsPage) {
    throw new Error('Object metadata item is not set in context store');
  }

  return { objectMetadataItem };
};
