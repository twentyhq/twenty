import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';

const StyledContent = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

// Shown for a result this client cannot read. It never exposes raw
// arguments or offers a control it does not understand.
export const AiChatInteractionFallback = () => {
  const { t } = useLingui();

  return (
    <StyledAiChatAskCard>
      <StyledContent>
        <span>{t`This result requires a newer version of the app.`}</span>
        <Button
          size="sm"
          variant="outline"
          startIcon={<IconRefresh />}
          onClick={() => window.location.reload()}
        >
          {t`Refresh`}
        </Button>
      </StyledContent>
    </StyledAiChatAskCard>
  );
};
