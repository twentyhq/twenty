import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTagsRow } from '@/onboarding/components/StyledOnboardingStepTagsRow';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingCreditsRewardTag } from '@/onboarding/components/import-contacts/OnboardingCreditsRewardTag';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { type OnboardingInstallableApp } from '@/onboarding/types/OnboardingInstallableApp';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconCheck, IconPlus } from 'twenty-ui/icon';
import { IconButton, MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
`;

const StyledBetaTag = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.grayScale.gray3};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${themeCssVariables.grayScale.gray10};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[6]};
  line-height: 1.4;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
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
  gap: 10px;
  min-width: 0;
`;

const StyledAppLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
`;

const StyledAppDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledInstallButton = styled.div`
  width: 100%;
`;

type InstallAppsContentProps = {
  apps: (OnboardingInstallableApp & { logo: string | null })[];
  selectedUniversalIdentifiers: string[];
  creditsRewardPerApp?: number;
  isCompleting: boolean;
  onToggleApp: (universalIdentifier: string) => void;
  onInstall: () => void;
  onSkip: () => void;
};

export const InstallAppsContent = ({
  apps,
  selectedUniversalIdentifiers,
  creditsRewardPerApp,
  isCompleting,
  onToggleApp,
  onInstall,
  onSkip,
}: InstallAppsContentProps) => {
  const { t } = useLingui();

  return (
    <StyledOnboardingStepPage>
      <StyledOnboardingStepHeading>
        <StyledTitleRow>
          <StyledOnboardingStepTitle>{t`Install your first apps`}</StyledOnboardingStepTitle>
          <StyledBetaTag>{t`Beta`}</StyledBetaTag>
        </StyledTitleRow>
        <StyledOnboardingStepSubtitle>
          {t`Get the most out of your CRM by installing some apps`}
        </StyledOnboardingStepSubtitle>
        {isDefined(creditsRewardPerApp) && (
          <StyledOnboardingStepTagsRow>
            <OnboardingCreditsRewardTag
              amount={creditsRewardPerApp * apps.length}
              suffix={t`free credits (${creditsRewardPerApp} per tool)`}
            />
          </StyledOnboardingStepTagsRow>
        )}
      </StyledOnboardingStepHeading>

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
                size="lg"
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
                size="small"
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
        <OnboardingSkipButton onClick={onSkip} disabled={isCompleting} />
      </StyledFooter>
    </StyledOnboardingStepPage>
  );
};
