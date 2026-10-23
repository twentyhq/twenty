import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatQuotedMessagePreview } from '@/ai/components/AiChatQuotedMessagePreview';
import { type AiChatQuotedMessageSource } from '@/ai/types/AiChatQuotedMessageSource';

const StyledPreview = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatComposerQuotePreviewProps = {
  source: AiChatQuotedMessageSource;
  onRemove: () => void;
  onNavigateToMessage?: (messageId: string) => void;
};

export const AiChatComposerQuotePreview = ({
  source,
  onRemove,
  onNavigateToMessage,
}: AiChatComposerQuotePreviewProps) => {
  const { t } = useLingui();

  return (
    <StyledPreview>
      <AiChatQuotedMessagePreview
        source={source}
        onNavigateToMessage={onNavigateToMessage}
      />
      <LightIconButton aria-label={t`Remove quote`} onClick={onRemove}>
        <IconX />
      </LightIconButton>
    </StyledPreview>
  );
};
