import { StyledInboxContentContainer } from '@/ai/components/StyledInboxContentContainer';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { inboxHasMessageSelector } from '@/ai/states/selectors/inboxHasMessageSelector';
import { inboxIsLoadingSelector } from '@/ai/states/selectors/inboxIsLoadingSelector';
import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorContainer = styled(StyledInboxContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]};
`;

export const InboxStandaloneError = () => {
  const inboxIsLoading = useAtomStateValue(inboxIsLoadingSelector);

  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const agentChatError = useAtomFamilyStateValue(agentChatErrorFamilyState, {
    threadId: inboxDisplayedThread,
  });

  const inboxHasMessage = useAtomStateValue(inboxHasMessageSelector);

  const shouldRender =
    !inboxHasMessage && isDefined(agentChatError) && !inboxIsLoading;

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledErrorContainer>
      <AiChatErrorRenderer error={agentChatError} />
    </StyledErrorContainer>
  );
};
