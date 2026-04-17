import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconEyeOff } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';

type SettingsApplicationDetailTitleProps = {
  displayName: string;
  description?: string;
  logoUrl?: string;
  isUnlisted?: boolean;
};

const StyledTitleContainer = styled.div`
  width: ${() => {
    return OBJECT_SETTINGS_WIDTH + 'px';
  }};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
`;

const StyledHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeaderTop = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLogo = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  overflow: hidden;
  width: 24px;
`;

const StyledLogoImage = styled.img`
  height: 32px;
  object-fit: contain;
  width: 32px;
`;

const StyledLogoPlaceholder = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledAppName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAppDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
`;

const StyledUnlistedBanner = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[8]};
  padding: ${themeCssVariables.spacing[3]};
`;

export const SettingsApplicationDetailTitle = ({
  displayName,
  description,
  logoUrl,
  isUnlisted = false,
}: SettingsApplicationDetailTitleProps) => {
  return (
    <StyledTitleContainer>
      {isUnlisted && (
        <StyledUnlistedBanner>
          <IconEyeOff size={16} />
          {t`Application not listed on the marketplace. It was shared via a direct link`}
        </StyledUnlistedBanner>
      )}
      <StyledHeader>
        <StyledHeaderLeft>
          <StyledHeaderTop>
            <StyledLogo>
              {logoUrl ? (
                <StyledLogoImage src={logoUrl} alt={displayName} />
              ) : (
                <StyledLogoPlaceholder>
                  {displayName.charAt(0).toUpperCase()}
                </StyledLogoPlaceholder>
              )}
            </StyledLogo>
            <StyledAppName>{displayName}</StyledAppName>
          </StyledHeaderTop>
          {description && (
            <StyledAppDescription>{description}</StyledAppDescription>
          )}
        </StyledHeaderLeft>
      </StyledHeader>
    </StyledTitleContainer>
  );
};
