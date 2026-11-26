import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { LightButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconChevronDown, IconCopy } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const COLLAPSED_MESSAGE_STACK_LINE_COUNT = 1;

const StyledMessageCard = styled(Card.Root)`
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledMessageFirstLine = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.regular};
  overflow-wrap: anywhere;
`;

const StyledMessageStackLine = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledShowMoreContainer = styled.div`
  align-self: flex-start;
`;

type DetailMessageCardProps = {
  title: string;
  message: string;
};

export const DetailMessageCard = ({
  title,
  message,
}: DetailMessageCardProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);

  const [firstMessageLine, ...messageStackLines] = message.split('\n');
  const displayedMessageStackLines = isExpanded
    ? messageStackLines
    : messageStackLines.slice(0, COLLAPSED_MESSAGE_STACK_LINE_COUNT);
  const hiddenMessageStackLineCount =
    messageStackLines.length - displayedMessageStackLines.length;

  return (
    <Section.Root>
      <Section.Header
        title={title}
        actions={
          <LightButton
            startIcon={<IconCopy />}
            onClick={() => copyToClipboard(message)}
          >
            {t`Copy`}
          </LightButton>
        }
      />
      <StyledMessageCard
        backgroundColor={themeCssVariables.background.secondary}
      >
        <StyledMessageFirstLine>{firstMessageLine}</StyledMessageFirstLine>
        {displayedMessageStackLines.map((messageStackLine, index) => (
          <StyledMessageStackLine key={index}>
            <OverflowingTextWithTooltip text={messageStackLine.trim()} />
          </StyledMessageStackLine>
        ))}
        {hiddenMessageStackLineCount > 0 && (
          <StyledShowMoreContainer>
            <LightButton
              emphasis="subtle"
              size="sm"
              startIcon={<IconChevronDown />}
              onClick={() => setIsExpanded(true)}
            >
              {t`More (${hiddenMessageStackLineCount})`}
            </LightButton>
          </StyledShowMoreContainer>
        )}
      </StyledMessageCard>
    </Section.Root>
  );
};
