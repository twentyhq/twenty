import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxQuotedMessagePreview } from '@/ai/components/AiChatQuotedMessagePreview';
import { type InboxQuotedMessageSource } from '@/ai/types/AiChatQuotedMessageSource';

const StyledReplyBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

type InboxComposerQuotePreviewProps = {
  source: InboxQuotedMessageSource;
  onRemove: () => void;
};

export const InboxComposerQuotePreview = ({
  source,
  onRemove,
}: InboxComposerQuotePreviewProps) => {
  const { t } = useLingui();

  return (
    <StyledReplyBar>
      <InboxQuotedMessagePreview source={source} label={t`Replying to`} />
      <LightIconButton aria-label={t`Remove quote`} onClick={onRemove}>
        <IconX />
      </LightIconButton>
    </StyledReplyBar>
  );
};
