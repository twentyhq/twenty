import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useContextStoreObjectMetadataItemOrThrow = (
  contextStoreInstanceId?: string,
) => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    contextStoreInstanceId,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataItemId ?? '',
  });

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      doNotTranslate('Object metadata item is not set in context store'),
    );
  }

  return { objectMetadataItem };
};
