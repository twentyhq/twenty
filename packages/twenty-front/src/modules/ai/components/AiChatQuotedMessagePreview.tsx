import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { IconArrowBackUp } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type AiChatQuotedMessageSource } from '@/ai/types/AiChatQuotedMessageSource';

const StyledReply = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledIcon = styled.span`
  display: flex;
  flex-shrink: 0;
`;

const StyledAuthorName = styled.span`
  flex-shrink: 0;
  max-width: 50%;
  min-width: 0;
`;

const StyledExcerpt = styled.span`
  flex: 1;
  min-width: 0;
`;

type AiChatQuotedMessagePreviewProps = {
  source: AiChatQuotedMessageSource;
  label?: string;
};

export const AiChatQuotedMessagePreview = ({
  source,
  label,
}: AiChatQuotedMessagePreviewProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const isAvailable = source.status === 'available';

  const getExcerpt = () => {
    if (source.status !== 'available') {
      return t`Original message unavailable`;
    }

    return isNonEmptyString(source.excerpt)
      ? source.excerpt
      : t`No text content`;
  };

  return (
    <StyledReply>
      <StyledIcon>
        <IconArrowBackUp
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIcon>
      {isDefined(label) && (
        <Text size="sm" color="tertiary">
          {label}
        </Text>
      )}
      {isAvailable && (
        <StyledAuthorName>
          <Text size="sm" weight="medium" color="secondary" truncate>
            {source.authorName}
          </Text>
        </StyledAuthorName>
      )}
      <StyledExcerpt>
        <Text size="sm" color="tertiary" truncate>
          {getExcerpt()}
        </Text>
      </StyledExcerpt>
    </StyledReply>
  );
};
