import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { isAgentChatCurrentContextActiveState } from '@/ai/states/isAgentChatCurrentContextActiveState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useGetObjectMetadataItemById } from '@/object-metadata/hooks/useGetObjectMetadataItemById';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useAgentChatRequestBody = () => {
  const currentAIChatThread = useRecoilValue(currentAIChatThreadState);
  const { getObjectMetadataItemById } = useGetObjectMetadataItemById();

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const isAgentChatCurrentContextActive = useRecoilValue(
    isAgentChatCurrentContextActiveState,
  );

  const buildRequestBody = (records?: ObjectRecord[]) => {
    const recordIdsByObjectMetadataNameSingular = [];

    if (
      isAgentChatCurrentContextActive === true &&
      isDefined(records) &&
      isDefined(contextStoreCurrentObjectMetadataItemId)
    ) {
      recordIdsByObjectMetadataNameSingular.push({
        objectMetadataNameSingular: getObjectMetadataItemById(
          contextStoreCurrentObjectMetadataItemId,
        ).nameSingular,
        recordIds: records.map(({ id }) => id),
      });
    }

    return {
      threadId: currentAIChatThread,
      recordIdsByObjectMetadataNameSingular,
    };
  };

  return { buildRequestBody };
};
