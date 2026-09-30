import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { InformationBannerDeletedRecord } from '@/information-banner/components/deleted-record/InformationBannerDeletedRecord';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledBannerContainer = styled.div`
  flex-shrink: 0;
  z-index: 1;
`;

export const AiChatPageDeletedThreadBanner = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const threadId =
    isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)
      ? currentAiChatThread
      : '';
  const deletedAt = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: threadId,
    fieldName: 'deletedAt',
  });

  if (!isDefined(deletedAt) || threadId === '') {
    return null;
  }

  return (
    <StyledBannerContainer>
      <InformationBannerDeletedRecord
        recordId={threadId}
        objectNameSingular={CoreObjectNameSingular.AgentChatThread}
      />
    </StyledBannerContainer>
  );
};
