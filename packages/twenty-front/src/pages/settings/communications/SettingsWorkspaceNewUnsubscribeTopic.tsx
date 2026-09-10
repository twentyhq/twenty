import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useCreateUnsubscribeTopic } from '@/settings/unsubscribe-topics/hooks/useCreateUnsubscribeTopic';
import { SETTINGS_UNSUBSCRIBE_TAB_IDS } from '@/settings/unsubscribers/constants/SettingsUnsubscribeTabIds';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { IconEye } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';
import { UnsubscribeTopicVisibility } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { NotFound } from '~/pages/not-found/NotFound';

export const SettingsWorkspaceNewUnsubscribeTopic = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();
  const { createUnsubscribeTopic, loading } = useCreateUnsubscribeTopic();
  const isEmailGroupEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const canSave = name.length > 0 && !loading;

  const navigateToTopics = useCallback(
    () =>
      navigate(
        SettingsPath.Unsubscribe,
        undefined,
        undefined,
        undefined,
        SETTINGS_UNSUBSCRIBE_TAB_IDS.TOPICS,
      ),
    [navigate],
  );

  const handleSave = useCallback(async () => {
    try {
      const result = await createUnsubscribeTopic({
        name,
        description: description || null,
        visibility: isPublic
          ? UnsubscribeTopicVisibility.PUBLIC
          : UnsubscribeTopicVisibility.PRIVATE,
      });
      const unsubscribeTopicId = result.data?.createUnsubscribeTopic.id;

      if (unsubscribeTopicId) {
        navigate(SettingsPath.UnsubscribeTopicDetail, {
          unsubscribeTopicId,
        });
      } else {
        navigateToTopics();
      }
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to create unsubscribe topic.`,
      });
    }
  }, [
    createUnsubscribeTopic,
    name,
    description,
    isPublic,
    navigate,
    navigateToTopics,
    enqueueToast,
    t,
  ]);

  if (!isEmailGroupEnabled) {
    return <NotFound />;
  }

  return (
    <SettingsPageLayout
      title={t`New Unsubscribe Topic`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        {
          children: t`Unsubscribe`,
          href: getSettingsPath(
            SettingsPath.Unsubscribe,
            undefined,
            undefined,
            SETTINGS_UNSUBSCRIBE_TAB_IDS.TOPICS,
          ),
        },
        { children: t`New Unsubscribe Topic` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={loading}
          isLoading={loading}
          onCancel={navigateToTopics}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Name`}
            description={t`The name recipients see for this topic.`}
          />
          <SettingsTextInput
            instanceId="unsubscribe-topic-name"
            label={t`Name`}
            placeholder={t`Newsletters`}
            value={name}
            onChange={setName}
            disabled={loading}
            fullWidth
          />
        </Section>
        <Section>
          <H2Title
            title={t`Description`}
            description={t`Optional context shown to recipients on the preferences page.`}
          />
          <SettingsTextInput
            instanceId="unsubscribe-topic-description"
            label={t`Description`}
            value={description}
            onChange={setDescription}
            disabled={loading}
            fullWidth
          />
        </Section>
        <Section>
          <H2Title
            title={t`Visibility`}
            description={t`Control whether recipients can find and manage this topic.`}
          />
          <Card rounded>
            <SettingsOptionCardContentSwitch
              Icon={IconEye}
              title={t`Listed on the unsubscribe page`}
              description={t`Public topics appear on the recipient preferences page.`}
              checked={isPublic}
              onChange={setIsPublic}
            />
          </Card>
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
