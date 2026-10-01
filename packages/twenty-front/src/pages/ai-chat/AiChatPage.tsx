import { styled } from '@linaria/react';
import { useParams } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatPageCloseSidePanelChatEffect } from '@/ai/components/AiChatPageCloseSidePanelChatEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { getDisplayedAiChatThreadId } from '@/ai/utils/getDisplayedAiChatThreadId';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShowPageContent } from '~/pages/object-record/RecordShowPage';

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

export const AiChatPage = () => {
  const { threadId } = useParams();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isMobile = useIsMobile();
  const chatObjectMetadata = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const chatRecordPageLayout = useAtomFamilySelectorValue(
    recordPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: chatObjectMetadata?.id ?? '' },
  );
  const displayedThreadId = getDisplayedAiChatThreadId({
    urlThreadId: threadId,
    currentAiChatThread,
  });

  return (
    <>
      <AiChatPageThreadUrlSyncEffect />
      <AiChatPageCloseSidePanelChatEffect />
      <AiChatPageContinueInSidePanelEffect />
      {isDefined(displayedThreadId) && isDefined(chatRecordPageLayout) ? (
        <RecordShowPageContent
          parameters={{
            objectNameSingular: CoreObjectNameSingular.AgentChatThread,
            objectRecordId: displayedThreadId,
          }}
          headerActions={isMobile && <AiChatCloseButton />}
          // The chat's title is all its header needs, and the conversation
          // takes the whole page
          headerTitleMode="record-title"
          isRecordIdentifierBarHidden
        />
      ) : (
        // Saved chats also use this surface until their record layout exists.
        <PageCardLayout header={<AiChatPageHeader />}>
          <StyledChatContainer>
            <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
              <AiChatTab />
            </AiChatSurfaceContext.Provider>
          </StyledChatContainer>
        </PageCardLayout>
      )}
    </>
  );
};
