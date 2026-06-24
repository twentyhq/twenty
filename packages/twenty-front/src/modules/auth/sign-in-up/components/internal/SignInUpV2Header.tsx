import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const TWENTY_LOGO_URL = `${window.location.origin}/images/icons/android/android-launchericon-192-192.png`;

const StyledHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledSide = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 0;
`;

const StyledLeftSide = styled(StyledSide)`
  justify-content: flex-end;
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledLogo = styled.div`
  background-size: cover;
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${themeCssVariables.spacing[6]};
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
      <StyledLogo style={{ backgroundImage: `url(${TWENTY_LOGO_URL})` }} />
      <StyledSide />
    </StyledHeader>
  );
};
