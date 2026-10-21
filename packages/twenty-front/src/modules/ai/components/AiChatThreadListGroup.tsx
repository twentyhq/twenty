import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: 0;
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
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
        <StyledTitle id={titleId}>{title}</StyledTitle>
        {isDefined(count) && <StyledCount>{count}</StyledCount>}
      </StyledHeader>
      {children}
    </section>
  );
};
