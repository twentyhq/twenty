import { styled } from '@linaria/react';
import { IconPlus } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  margin-left: ${themeCssVariables.spacing[1]};
`;

type CoreObjectTableCreateButtonProps = {
  ariaLabel: string;
  onClick: () => void;
};

export const CoreObjectTableCreateButton = ({
  ariaLabel,
  onClick,
}: CoreObjectTableCreateButtonProps) => (
  <StyledContainer>
    <LightIconButton
      Icon={IconPlus}
      size="small"
      accent="tertiary"
      aria-label={ariaLabel}
      onClick={onClick}
    />
  </StyledContainer>
);
