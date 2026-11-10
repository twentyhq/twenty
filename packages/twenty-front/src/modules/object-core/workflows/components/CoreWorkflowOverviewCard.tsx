import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCard = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.header`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: 0;
`;

const StyledCaption = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type CoreWorkflowOverviewCardProps = {
  title: string;
  caption?: string;
  children: ReactNode;
};

export const CoreWorkflowOverviewCard = ({
  title,
  caption,
  children,
}: CoreWorkflowOverviewCardProps) => (
  <StyledCard aria-label={title}>
    <StyledHeader>
      <StyledTitle>{title}</StyledTitle>
      {isNonEmptyString(caption) && <StyledCaption>{caption}</StyledCaption>}
    </StyledHeader>
    {children}
  </StyledCard>
);
