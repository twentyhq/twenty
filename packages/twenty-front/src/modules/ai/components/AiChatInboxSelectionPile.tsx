import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadActivityTime } from '@/ai/components/AiChatThreadActivityTime';
import { AiChatThreadAvatar } from '@/ai/components/AiChatThreadAvatar';
import { AiChatThreadSubtitle } from '@/ai/components/AiChatThreadSubtitle';
import { AiChatThreadTitle } from '@/ai/components/AiChatThreadTitle';
import { AI_CHAT_INBOX_SELECTION_PILE_MAX_CARDS } from '@/ai/constants/AiChatInboxSelectionPileMaxCards';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

const StyledPile = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 480px;
  width: 100%;
`;

// Each card sits a step lower and wider than the one behind it, leaving the
// title of the cards behind in view
const StyledCard = styled.div<{ $depth: number }>`
  align-items: flex-start;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  margin: 0 calc(${themeCssVariables.spacing[3]} * ${({ $depth }) => $depth});
  padding: ${themeCssVariables.spacing[4]};
  text-align: left;

  & + & {
    margin-top: calc(-1 * ${themeCssVariables.spacing[8]});
  }
`;

const StyledLeading = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding-top: ${themeCssVariables.spacing['0.5']};
  width: ${themeCssVariables.spacing[7]};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

type AiChatInboxSelectionPileProps = {
  threads: AgentChatThreadRecord[];
};

export const AiChatInboxSelectionPile = ({
  threads,
}: AiChatInboxSelectionPileProps) => {
  const pileThreads = threads.slice(0, AI_CHAT_INBOX_SELECTION_PILE_MAX_CARDS);

  return (
    <StyledPile aria-hidden>
      {pileThreads.map((thread, index) => (
        <StyledCard key={thread.id} $depth={pileThreads.length - 1 - index}>
          <StyledLeading>
            <AiChatThreadAvatar thread={thread} />
          </StyledLeading>
          <StyledContent>
            <StyledHeading>
              <AiChatThreadTitle thread={thread} />
              <AiChatThreadActivityTime thread={thread} />
            </StyledHeading>
            <AiChatThreadSubtitle thread={thread} />
          </StyledContent>
        </StyledCard>
      ))}
    </StyledPile>
  );
};
