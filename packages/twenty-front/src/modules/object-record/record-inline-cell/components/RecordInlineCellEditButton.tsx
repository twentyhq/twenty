import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui-deprecated/display';
import { FloatingIconButton } from 'twenty-ui-deprecated/input';
import { AnimatedContainer } from 'twenty-ui-deprecated/utilities';

const StyledInlineCellButtonContainer = styled.div`
  align-items: center;
  display: flex;
`;

export const RecordInlineCellButton = ({
  Icon,
  onClick,
}: {
  Icon: IconComponent;
  onClick?: () => void;
}) => {
  return (
    <AnimatedContainer>
      <StyledInlineCellButtonContainer onClick={onClick}>
        <FloatingIconButton
          size="small"
          Icon={Icon}
          data-testid="inline-cell-edit-mode-container"
        />
      </StyledInlineCellButtonContainer>
    </AnimatedContainer>
  );
};
