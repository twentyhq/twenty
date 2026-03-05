import { styled } from '@linaria/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

type EventCardProps = {
  children: React.ReactNode;
  isOpen: boolean;
};

const StyledCardContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${themeCssVariables.spacing[2]};
  width: 400px;
  padding: ${themeCssVariables.spacing[2]} 0px ${themeCssVariables.spacing[1]}
    0px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 300px;
  }
`;

const StyledCardInnerContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  padding: ${themeCssVariables.spacing[2]};
  flex-direction: column;
  align-items: flex-start;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  align-self: stretch;
`;

export const EventCard = ({ children, isOpen }: EventCardProps) => {
  return (
    isOpen && (
      <StyledCardContainer>
        <StyledCardInnerContainer>{children}</StyledCardInnerContainer>
      </StyledCardContainer>
    )
  );
};
