import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { type OnboardingInstallableApp } from '@/onboarding/types/OnboardingInstallableApp';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconCheck, IconPlus } from 'twenty-ui/icon';
import { IconButton, MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const CONTENT_BLOCK_WIDTH = 340;

const StyledContent = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[14]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[16]} ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledBetaTag = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
`;

const StyledCreditsRow = styled.div`
  display: flex;
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledAppRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledAppText = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledAppLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledAppDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: ${CONTENT_BLOCK_WIDTH}px;
`;

const StyledInstallButton = styled.div`
  width: 100%;
`;

const StyledSkipButton = styled.button`
  background-color: transparent;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[5]};
`;

type InstallAppsProps = {
  apps: (OnboardingInstallableApp & { logo: string | null })[];
  selectedUniversalIdentifiers: string[];
  creditsRewardPerApp?: number;
  isCompleting: boolean;
  onToggleApp: (universalIdentifier: string) => void;
  onInstall: () => void;
  onSkip: () => void;
};

export const InstallApps = ({
  apps,
  selectedUniversalIdentifiers,
  creditsRewardPerApp,
  isCompleting,
  onToggleApp,
  onInstall,
  onSkip,
}: InstallAppsProps) => {
  const { t } = useLingui();

  return (
    <StyledContent>
      <StyledHeading>
        <StyledTitleRow>
          <StyledTitle>{t`Install your first apps`}</StyledTitle>
          <StyledBetaTag>{t`Beta`}</StyledBetaTag>
        </StyledTitleRow>
        <StyledSubtitle>
          {t`Get the most out of your CRM by installing some apps`}
        </StyledSubtitle>
        {isDefined(creditsRewardPerApp) && (
          <StyledCreditsRow>
            <OnboardingCreditsRewardTag
              amount={creditsRewardPerApp * apps.length}
              suffix={t`free credits (${creditsRewardPerApp} per tool)`}
            />
          </StyledCreditsRow>
        )}
      </StyledHeading>

      <StyledCard>
        {apps.map((app) => {
          const labelText = t(app.label);
          const isSelected = selectedUniversalIdentifiers.includes(
            app.universalIdentifier,
          );

          return (
            <StyledAppRow key={app.universalIdentifier}>
              <Avatar
                avatarUrl={getAbsoluteImageUrl(app.logo)}
                placeholder={labelText}
                placeholderColorSeed={app.universalIdentifier}
                size="md"
                type="squared"
              />
              <StyledAppText>
                <StyledAppLabel>{labelText}</StyledAppLabel>
                <StyledAppDescription>
                  {t(app.description)}
                </StyledAppDescription>
              </StyledAppText>
              <IconButton
                Icon={isSelected ? IconCheck : IconPlus}
                variant="secondary"
                accent={isSelected ? 'blue' : 'default'}
                ariaLabel={
                  isSelected ? t`Deselect ${labelText}` : t`Select ${labelText}`
                }
                onClick={() => onToggleApp(app.universalIdentifier)}
              />
            </StyledAppRow>
          );
        })}
      </StyledCard>

      <StyledFooter>
        <StyledInstallButton>
          <MainButton
            title={t`Install`}
            onClick={onInstall}
            disabled={isCompleting}
            fullWidth
          />
        </StyledInstallButton>
        <StyledSkipButton
          type="button"
          onClick={onSkip}
          disabled={isCompleting}
        >
          {t`Skip`}
        </StyledSkipButton>
      </StyledFooter>
    </StyledContent>
  );
};
