import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { useStore } from 'jotai';
import { objectMetadataItemByUniversalIdentifierFamilySelector } from '@/object-metadata/states/objectMetadataItemByUniversalIdentifierFamilySelector';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import { assertIsDefinedOrThrow, CustomError } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useAiChatThreadRename = (thread: {
  id: string;
  title?: string | null;
}) => {
  const store = useStore();
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueToast } = useToast();

  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(thread.title ?? '');

  const startRename = () => {
    setDraftTitle(thread.title ?? '');
    setIsRenaming(true);
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setDraftTitle(thread.title ?? '');
  };

  const commitRename = async (nextTitle: string) => {
    const trimmed = nextTitle.trim();

    if (trimmed.length === 0 || trimmed === (thread.title ?? '')) {
      setIsRenaming(false);
      return;
    }

    try {
      const chatObjectMetadataItem = store.get(
        objectMetadataItemByUniversalIdentifierFamilySelector.selectorFamily(
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        ),
      );
      assertIsDefinedOrThrow(
        chatObjectMetadataItem,
        new CustomError(
          doNotTranslate(
            `Object metadata item not found for universal identifier ${STANDARD_OBJECTS.agentChatThread.universalIdentifier}`,
          ),
          'OBJECT_METADATA_ITEM_NOT_FOUND',
        ),
      );

      await updateOneRecord({
        objectNameSingular: chatObjectMetadataItem.nameSingular,
        idToUpdate: thread.id,
        updateOneRecordInput: { title: trimmed },
      });
      setIsRenaming(false);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  };
};
