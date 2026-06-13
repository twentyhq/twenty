import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';

import { useCreateMessageTopic } from '@/settings/unsubscribe-groups/hooks/useCreateMessageTopic';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { MessageTopicVisibility } from '~/generated-metadata/graphql';
import { H2Title, IconEye } from 'twenty-ui-deprecated/display';
import { Card, Section } from 'twenty-ui-deprecated/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsWorkspaceNewUnsubscribeGroup = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { createMessageTopic, loading } = useCreateMessageTopic();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const canSave = name.length > 0 && !loading;

  const handleSave = useCallback(async () => {
    try {
      const result = await createMessageTopic({
        name,
        description: description || null,
        visibility: isPublic
          ? MessageTopicVisibility.PUBLIC
          : MessageTopicVisibility.PRIVATE,
      });
      const messageTopicId = result.data?.createMessageTopic.id;

      if (messageTopicId) {
        navigate(SettingsPath.UnsubscribeGroupDetail, {
          messageTopicId,
        });
      } else {
        navigate(SettingsPath.WorkspaceEmail);
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to create unsubscribe group.`,
      });
    }
  }, [
    createMessageTopic,
    name,
    description,
    isPublic,
    navigate,
    enqueueErrorSnackBar,
    t,
  ]);

  return (
    <SettingsPageLayout
      title={t`New Unsubscribe Group`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Email`,
          href: getSettingsPath(SettingsPath.WorkspaceEmail),
        },
        { children: t`New Unsubscribe Group` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={loading}
          isLoading={loading}
          onCancel={() => navigate(SettingsPath.WorkspaceEmail)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Name`}
            description={t`The name recipients see for this group of emails.`}
          />
          <SettingsTextInput
            instanceId="unsubscribe-group-name"
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
            instanceId="unsubscribe-group-description"
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
            description={t`Control whether recipients can find and manage this group.`}
          />
          <Card rounded>
            <SettingsOptionCardContentToggle
              Icon={IconEye}
              title={t`Listed on the unsubscribe page`}
              description={t`Public groups appear on the recipient preferences page.`}
              checked={isPublic}
              onChange={setIsPublic}
            />
          </Card>
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
