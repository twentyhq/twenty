import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { FloatingIconButton } from 'twenty-ui/input';
import { AnimatedContainer } from 'twenty-ui/layout';

const StyledInlineCellButtonContainer = styled.div`
  align-items: center;
  display: flex;
`;

export const RecordInlineCellButton = ({
  Icon,
  onClick,
  ariaLabel,
}: {
  Icon: IconComponent;
  onClick?: () => void;
  ariaLabel?: string;
}) => {
  return (
    <AnimatedContainer>
      <StyledInlineCellButtonContainer onClick={onClick}>
        <FloatingIconButton
          size="small"
          Icon={Icon}
          ariaLabel={ariaLabel}
          data-testid="inline-cell-edit-mode-container"
        />
      </StyledInlineCellButtonContainer>
    </AnimatedContainer>
  );
};
