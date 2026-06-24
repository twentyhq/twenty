import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const HEADER_CENTER_WIDTH = 340;

const StyledHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledSide = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  min-width: 0;
`;

const StyledLeftSide = styled(StyledSide)`
  justify-content: flex-end;
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledCenter = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 ${HEADER_CENTER_WIDTH}px;
  justify-content: flex-start;
  min-width: 0;
`;

const StyledLogo = styled.div`
  background-image: url('/images/integrations/twenty-logo.svg');
  background-size: cover;
  height: ${themeCssVariables.spacing[6]};
  opacity: 0.4;
  width: ${themeCssVariables.spacing[6]};
`;

type SignInUpV2HeaderProps = {
  onBack: () => void;
};

export const SignInUpV2Header = ({ onBack }: SignInUpV2HeaderProps) => {
  const { t } = useLingui();

  return (
    <StyledHeader>
      <StyledLeftSide>
        <LightIconButton
          Icon={IconChevronLeft}
          accent="tertiary"
          size="medium"
          onClick={onBack}
          aria-label={t`Go back`}
        />
      </StyledLeftSide>
      <StyledCenter>
        <StyledLogo />
      </StyledCenter>
      <StyledSide />
    </StyledHeader>
  );
};
