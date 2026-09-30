import { OnboardingRewardMainButton } from '@/onboarding/components/OnboardingRewardMainButton';
import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { useOnboardingStepEnterHotkey } from '@/onboarding/hooks/useOnboardingStepEnterHotkey';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { type OnboardingInstallableApp } from '@/onboarding/types/OnboardingInstallableApp';
import { PageFocusId } from '@/types/PageFocusId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledTiles = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledTile = styled.button`
  align-items: flex-start;
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  min-height: 156px;
  padding: ${themeCssVariables.spacing[3]};
  position: relative;
  text-align: left;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
  }

  &:disabled {
    cursor: default;
  }
`;

const StyledTileContent = styled.span`
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: opacity 0.15s ease;

  [aria-pressed='false'] > & {
    opacity: 0.5;
  }

  [aria-pressed='false']:hover > & {
    opacity: 0.8;
  }
`;

const StyledTileCheck = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 50%;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.inverted};
  corner-shape: round;
  display: flex;
  height: 18px;
  justify-content: center;
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: ${themeCssVariables.spacing[2]};
  width: 18px;

  [aria-pressed='true'] > & {
    background-color: ${themeCssVariables.background.primaryInverted};
    border-color: ${themeCssVariables.background.primaryInverted};
  }
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
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledInstallButton = styled.div`
  width: 100%;
`;

type InstallAppsContentProps = {
  apps: (OnboardingInstallableApp & { logoUrl: string | null })[];
};

export const InstallAppsContent = ({ apps }: InstallAppsContentProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const {
    selectedUniversalIdentifiers,
    isCompleting,
    toggleApp,
    installSelectedAppsAndContinue,
    skip,
  } = useInstallOnboardingApps(apps.map((app) => app.universalIdentifier));
  const onboardingCreditsProgress = useAtomStateValue(
    onboardingCreditsProgressSelector,
  );
  const creditsReward =
    onboardingCreditsProgress.rewardCreditsByStep.installApps;

  useOnboardingStepEnterHotkey({
    focusId: PageFocusId.InstallApps,
    onEnter: () => {
      void installSelectedAppsAndContinue();
    },
  });

  const hasApps = isNonEmptyArray(apps);
  const hasSelectedApps = isNonEmptyArray(selectedUniversalIdentifiers);
  const selectedAppsCount = selectedUniversalIdentifiers.length;

  const getInstallLabel = () => {
    if (!hasSelectedApps) {
      return t`Continue without apps`;
    }

    if (selectedAppsCount === apps.length) {
      return plural(selectedAppsCount, {
        one: 'Install # app',
        other: 'Install all # apps',
      });
    }

    return plural(selectedAppsCount, {
      one: 'Install # app',
      other: 'Install # apps',
    });
  };

  return (
    <StyledOnboardingStepPage>
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>{t`Start with the essentials`}</StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {hasApps
              ? plural(apps.length, {
                  one: 'One app, installed in one click.',
                  other: '# apps, installed in one click.',
                })
              : t`No apps are available to install right now`}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      {hasApps && (
        <OnboardingStepAnimatedItem index={2}>
          <StyledTiles>
            {apps.map((app) => {
              const labelText = t(app.label);
              const isSelected = selectedUniversalIdentifiers.includes(
                app.universalIdentifier,
              );

              return (
                <StyledTile
                  key={app.universalIdentifier}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isCompleting}
                  onClick={() => toggleApp(app.universalIdentifier)}
                >
                  <StyledTileContent>
                    <Avatar
                      src={getAbsoluteImageUrl(app.logoUrl)}
                      name={labelText}
                      colorSeed={app.universalIdentifier}
                      size="xl"
                      shape="rounded-square"
                    />
                    <StyledAppLabel>{labelText}</StyledAppLabel>
                    <StyledAppDescription>
                      {t(app.description)}
                    </StyledAppDescription>
                  </StyledTileContent>
                  <StyledTileCheck aria-hidden>
                    {isSelected && (
                      <IconCheck size={theme.icon.size.sm} stroke={3} />
                    )}
                  </StyledTileCheck>
                </StyledTile>
              );
            })}
          </StyledTiles>
        </OnboardingStepAnimatedItem>
      )}

      <OnboardingStepAnimatedItem index={3}>
        <StyledFooter>
          {hasApps && (
            <StyledInstallButton>
              <OnboardingRewardMainButton
                label={getInstallLabel()}
                creditsReward={hasSelectedApps ? creditsReward : 0}
                disabled={isCompleting}
                onClick={installSelectedAppsAndContinue}
              />
            </StyledInstallButton>
          )}
          <OnboardingSkipButton onClick={skip} disabled={isCompleting} />
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledOnboardingStepPage>
  );
};
