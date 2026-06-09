import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui-deprecated/display';
import { UndecoratedLink } from 'twenty-ui-deprecated/navigation';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useRedirectToDefaultDomain } from '~/modules/domain-manager/hooks/useRedirectToDefaultDomain';

type LogoProps = {
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  placeholder?: string | null;
  onClick?: () => void;
};

const StyledContainer = styled.div`
  height: ${themeCssVariables.spacing[12]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};

  position: relative;
  width: ${themeCssVariables.spacing[12]};
`;

const StyledSecondaryLogo = styled.img`
  border-radius: ${themeCssVariables.border.radius.xs};
  height: ${themeCssVariables.spacing[6]};
  width: ${themeCssVariables.spacing[6]};
`;

const StyledSecondaryLogoContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  bottom: calc(-1 * ${themeCssVariables.spacing[3]});
  display: flex;
  height: ${themeCssVariables.spacing[7]};
  justify-content: center;

  position: absolute;
  right: calc(-1 * ${themeCssVariables.spacing[3]});
  width: ${themeCssVariables.spacing[7]};
`;

const StyledPrimaryLogo = styled.div`
  background-size: cover;
  height: 100%;
  width: 100%;
`;

export const Logo = ({
  primaryLogo,
  secondaryLogo,
  placeholder,
  onClick,
}: LogoProps) => {
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();

  const hasPrimaryLogo = isDefined(primaryLogo);

  const primaryLogoUrl = hasPrimaryLogo
    ? getImageAbsoluteURI({
        imageUrl: primaryLogo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : null;

  const secondaryLogoUrl = isNonEmptyString(secondaryLogo)
    ? getImageAbsoluteURI({
        imageUrl: secondaryLogo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : null;

  // When no workspace logo is set, render nothing — never fall back to the
  // Twenty default icon so every client deployment is fully white-labeled.
  if (!hasPrimaryLogo && !isDefined(secondaryLogoUrl) && !isDefined(placeholder)) {
    return null;
  }

  return (
    <StyledContainer onClick={() => onClick?.()}>
      {hasPrimaryLogo && isDefined(primaryLogoUrl) ? (
        <StyledPrimaryLogo
          style={{ backgroundImage: `url(${primaryLogoUrl})` }}
        />
      ) : (
        // No logo uploaded yet — link back to default domain so admins can
        // still navigate, but show nothing instead of the Twenty icon.
        <UndecoratedLink
          to={AppPath.SignInUp}
          onClick={redirectToDefaultDomain}
        />
      )}
      {isDefined(secondaryLogoUrl) ? (
        <StyledSecondaryLogoContainer>
          <StyledSecondaryLogo src={secondaryLogoUrl} />
        </StyledSecondaryLogoContainer>
      ) : (
        isDefined(placeholder) && (
          <StyledSecondaryLogoContainer>
            <Avatar
              size="lg"
              placeholder={placeholder}
              type="squared"
              placeholderColorSeed={placeholder}
            />
          </StyledSecondaryLogoContainer>
        )
      )}
    </StyledContainer>
  );
};
