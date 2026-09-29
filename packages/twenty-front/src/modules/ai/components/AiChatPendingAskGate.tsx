import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatAskCard } from '@/ai/components/AiChatAskCard';
import { useAgentChatPendingAsks } from '@/ai/hooks/useAgentChatPendingAsks';

const StyledGate = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledWaitingCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

type AiChatPendingAskGateProps = {
  threadId: string;
  children: ReactNode;
};

// The agent continues once every call it paused on is answered, so the
// cards come one at a time, oldest first, each taking the composer's place.
export const AiChatPendingAskGate = ({
  threadId,
  children,
}: AiChatPendingAskGateProps) => {
  const { t } = useLingui();
  const pendingAsks = useAgentChatPendingAsks({ threadId });
  const [currentAsk] = pendingAsks;

  if (!isDefined(currentAsk)) {
    return children;
  }

  const waitingCount = pendingAsks.length;

  return (
    <StyledGate>
      {waitingCount > 1 && (
        <StyledWaitingCount>
          {t`${waitingCount} requests are waiting on you`}
        </StyledWaitingCount>
      )}
      <AiChatAskCard key={currentAsk.id} pendingAsk={currentAsk} />
    </StyledGate>
  );
};
