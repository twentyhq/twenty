import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Avatar, IconEyeOff } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';

type SettingsApplicationDetailTitleProps = {
  displayName: string;
  description?: string;
  logoUrl?: string;
  applicationId?: string;
  applicationName?: string;
  universalIdentifier?: string;
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
  gap: ${themeCssVariables.spacing[1]};
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
  applicationId,
  isUnlisted = false,
}: SettingsApplicationDetailTitleProps) => {
  const descriptionSummary = getApplicationDescriptionSummary(description);

  const { applicationChipData } = useApplicationChipData({
    applicationId,
  });

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
            <Avatar
              type="app"
              size="lg"
              avatarUrl={applicationChipData.logo}
              placeholder={applicationChipData.name}
              placeholderColorSeed={applicationChipData.seed}
              color={applicationChipData.colors?.color}
              backgroundColor={applicationChipData.colors?.backgroundColor}
              borderColor={applicationChipData.colors?.borderColor}
            />
            <StyledAppName>{displayName}</StyledAppName>
          </StyledHeaderTop>
          {descriptionSummary && (
            <StyledAppDescription>{descriptionSummary}</StyledAppDescription>
          )}
        </StyledHeaderLeft>
      </StyledHeader>
    </StyledTitleContainer>
  );
};
