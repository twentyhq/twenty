import { AnimatedContainer } from '@/ui/layout/animation/components/internal/AnimatedContainer/AnimatedContainer';
import { styled } from '@linaria/react';
import { IconButton } from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

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
  const { t } = useLingui();
  return (
    <AnimatedContainer>
      <StyledInlineCellButtonContainer>
        <IconButton
          elevated
          size="sm"
          aria-label={ariaLabel ?? t`Edit field`}
          onClick={onClick}
          data-testid="inline-cell-edit-mode-container"
        >
          <Icon />
        </IconButton>
      </StyledInlineCellButtonContainer>
    </AnimatedContainer>
  );
};
