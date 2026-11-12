import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { type AiChatQuotedMessageSource } from '@/ai/types/AiChatQuotedMessageSource';

const StyledQuote = styled.div`
  border-left: 2px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledNavigation = styled.div`
  align-self: flex-start;
`;

type AiChatQuotedMessagePreviewProps = {
  source: AiChatQuotedMessageSource;
  onNavigateToMessage?: (messageId: string) => void;
};

export const AiChatQuotedMessagePreview = ({
  source,
  onNavigateToMessage,
}: AiChatQuotedMessagePreviewProps) => {
  const { t } = useLingui();

  if (source.status === 'unavailable') {
    return (
      <StyledQuote>
        <Text size="sm" color="tertiary">
          {t`Original message unavailable`}
        </Text>
      </StyledQuote>
    );
  }

  const { messageId } = source;

  return (
    <StyledQuote>
      <StyledHeader>
        {source.authorAvatar}
        <Text size="sm" weight="medium" color="primary" truncate>
          {source.authorName}
        </Text>
      </StyledHeader>
      {isNonEmptyString(source.excerpt) ? (
        <LazyMarkdownRenderer text={source.excerpt} noImage />
      ) : (
        <Text size="sm" color="tertiary">
          {t`No text content`}
        </Text>
      )}
      {isDefined(onNavigateToMessage) && isDefined(messageId) && (
        <StyledNavigation>
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconArrowUpRight />}
            onClick={() => onNavigateToMessage(messageId)}
          >
            {t`View original message`}
          </Button>
        </StyledNavigation>
      )}
    </StyledQuote>
  );
};
