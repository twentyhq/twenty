import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSectionTitle = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[5]};
`;

type AiChatContextCardSectionProps = {
  title: string;
  children: ReactNode;
};

export const AiChatContextCardSection = ({
  title,
  children,
}: AiChatContextCardSectionProps) => (
  <StyledSection>
    <StyledSectionTitle>{title}</StyledSectionTitle>
    {children}
  </StyledSection>
);
