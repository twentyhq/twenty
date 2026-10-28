import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatThreadListVariant } from '@/ai/types/AiChatThreadListVariant';

const StyledGroup = styled.section<{ $isCompact: boolean }>`
  display: ${({ $isCompact }) => ($isCompact ? 'flex' : 'block')};
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div<{ $isCompact: boolean }>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${({ $isCompact }) =>
    $isCompact
      ? `0 ${themeCssVariables.spacing[1]}`
      : `${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]}`};
`;

const StyledTitle = styled.h3<{ $isCompact: boolean }>`
  margin: 0;
  padding: ${({ $isCompact }) =>
    $isCompact ? '0' : `${themeCssVariables.spacing[1]} 0`};
`;

const StyledThreads = styled.div<{ $isCompact: boolean }>`
  display: ${({ $isCompact }) => ($isCompact ? 'flex' : 'contents')};
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
`;

type AiChatThreadListGroupProps = {
  title: string;
  variant?: AiChatThreadListVariant;
  count?: number;
  children: ReactNode;
};

export const AiChatThreadListGroup = ({
  title,
  variant = 'default',
  count,
  children,
}: AiChatThreadListGroupProps) => {
  const titleId = useId();
  const isCompact = variant === 'compact';

  return (
    <StyledGroup $isCompact={isCompact} aria-labelledby={titleId}>
      <StyledHeader $isCompact={isCompact}>
        <Text
          render={<StyledTitle $isCompact={isCompact} />}
          id={titleId}
          size={isCompact ? 'sm' : 'md'}
          weight={isCompact ? 'semibold' : 'medium'}
          color={isCompact ? 'tertiary' : 'primary'}
        >
          {title}
        </Text>
        {isDefined(count) && (
          <Text render={<span />} size="sm" color="light">
            {count}
          </Text>
        )}
      </StyledHeader>
      <StyledThreads $isCompact={isCompact}>{children}</StyledThreads>
    </StyledGroup>
  );
};
