import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { ShimmeringText } from '@/ai/components/ShimmeringText';

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitle = styled.div`
  flex: 0 1 auto;
  max-width: 60%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSeparator = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
`;

const StyledPreview = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type AiChatThreadCompactContentProps = {
  title: ReactNode;
  subtitle: ReactNode;
  isStreaming: boolean;
};

export const AiChatThreadCompactContent = ({
  title,
  subtitle,
  isStreaming,
}: AiChatThreadCompactContentProps) => (
  <StyledContent>
    <StyledTitle>{title}</StyledTitle>
    {isDefined(subtitle) && (
      <>
        <StyledSeparator aria-hidden>·</StyledSeparator>
        <StyledPreview>
          {isStreaming ? <ShimmeringText>{subtitle}</ShimmeringText> : subtitle}
        </StyledPreview>
      </>
    )}
  </StyledContent>
);
