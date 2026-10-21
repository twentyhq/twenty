import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h3`
  margin: 0;
  padding: ${themeCssVariables.spacing[1]} 0;
`;

type AiChatThreadListGroupProps = {
  title: string;
  count?: number;
  children: ReactNode;
};

export const AiChatThreadListGroup = ({
  title,
  count,
  children,
}: AiChatThreadListGroupProps) => {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId}>
      <StyledHeader>
        <Text
          render={<StyledTitle />}
          id={titleId}
          size="md"
          weight="medium"
          color="primary"
        >
          {title}
        </Text>
        {isDefined(count) && (
          <Text render={<span />} size="sm" color="light">
            {count}
          </Text>
        )}
      </StyledHeader>
      {children}
    </section>
  );
};
