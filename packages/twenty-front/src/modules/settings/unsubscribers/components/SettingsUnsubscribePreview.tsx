import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsUnsubscribePreviewSender } from '@/settings/unsubscribers/components/SettingsUnsubscribePreviewSender';
import { SettingsUnsubscribePreviewTracking } from '@/settings/unsubscribers/components/SettingsUnsubscribePreviewTracking';
import { getUnsubscribePageHeaderDescription } from '@/settings/unsubscribers/utils/getUnsubscribePageHeaderDescription';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { MainButton } from 'twenty-ui/components/input';
import { LabeledSeparator, Section } from 'twenty-ui/components/layout';
import { Checkbox } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { UnsubscribeTopicVisibility } from '~/generated-metadata/graphql';

const PREVIEW_RECIPIENT_EMAIL_ADDRESS = 'name@example.com';

const StyledViewport = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]} ${themeCssVariables.spacing[6]};
`;

const StyledCardContainer = styled.div`
  max-width: 420px;
  width: 100%;
`;

const StyledCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[8]};
`;

const StyledTopics = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTopicLabel = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const SettingsUnsubscribePreview = () => {
  const { t } = useLingui();
  const { unsubscribeTopics, loading } = useUnsubscribeTopics();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const publicTopics = unsubscribeTopics.filter(
    (topic) => topic.visibility === UnsubscribeTopicVisibility.PUBLIC,
  );

  const workspaceName = currentWorkspace?.displayName;
  const isOpenTrackingEnabled =
    currentWorkspace?.isCampaignOpenTrackingEnabled ?? false;
  const isClickTrackingEnabled =
    currentWorkspace?.isCampaignClickTrackingEnabled ?? false;

  const hasPublicTopics = publicTopics.length > 0;
  const isTrackingActive = isOpenTrackingEnabled || isClickTrackingEnabled;
  const hasPreferences = hasPublicTopics || isTrackingActive;

  return (
    <Section.Root>
      <Section.Header
        title={t`Unsubscribe page`}
        description={t`Preview of the page recipients see when they unsubscribe`}
      />
      <StyledViewport>
        {!loading && (
          <StyledCardContainer>
            <Card.Root
              fullWidth
              backgroundColor={themeCssVariables.background.primary}
            >
              <StyledCardBody>
                <div>
                  <SettingsUnsubscribePreviewSender
                    workspaceName={workspaceName}
                    workspaceLogo={currentWorkspace?.logo}
                  />
                  <Section.Header
                    level={3}
                    size="lg"
                    title={t`Do you want to unsubscribe?`}
                    description={getUnsubscribePageHeaderDescription({
                      recipientEmailAddress: PREVIEW_RECIPIENT_EMAIL_ADDRESS,
                      hasPublicTopics,
                      isTrackingActive,
                    })}
                  />
                  {hasPublicTopics && (
                    <StyledTopics>
                      {publicTopics.map((topic) => (
                        <StyledTopicLabel key={topic.id}>
                          <Checkbox defaultChecked />
                          {topic.name ?? t`Untitled topic`}
                        </StyledTopicLabel>
                      ))}
                    </StyledTopics>
                  )}
                </div>
                {isTrackingActive && (
                  <SettingsUnsubscribePreviewTracking
                    senderName={
                      isNonEmptyString(workspaceName)
                        ? workspaceName
                        : t`This sender`
                    }
                    isOpenTrackingEnabled={isOpenTrackingEnabled}
                    isClickTrackingEnabled={isClickTrackingEnabled}
                  />
                )}
                {hasPreferences ? (
                  <StyledActions>
                    <MainButton fullWidth>{t`Update`}</MainButton>
                    <LabeledSeparator>{t`Or`}</LabeledSeparator>
                    <MainButton fullWidth variant="outline" elevated={false}>
                      {t`Unsubscribe all`}
                    </MainButton>
                  </StyledActions>
                ) : (
                  <MainButton fullWidth>{t`Unsubscribe`}</MainButton>
                )}
              </StyledCardBody>
            </Card.Root>
          </StyledCardContainer>
        )}
      </StyledViewport>
    </Section.Root>
  );
};
