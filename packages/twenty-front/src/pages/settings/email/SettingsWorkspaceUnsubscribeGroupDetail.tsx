import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useMessageTopics } from '@/activities/emails/hooks/useMessageTopics';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useDeleteMessageTopic } from '@/settings/unsubscribe-groups/hooks/useDeleteMessageTopic';
import { useUpdateMessageTopic } from '@/settings/unsubscribe-groups/hooks/useUpdateMessageTopic';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { MessageTopicVisibility } from '~/generated-metadata/graphql';
import { H2Title, IconEye, IconTrash } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { Card, Section } from 'twenty-ui-deprecated/layout';
import { NotFound } from '~/pages/not-found/NotFound';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_UNSUBSCRIBE_GROUP_MODAL_ID = 'delete-unsubscribe-group-modal';

export const SettingsWorkspaceUnsubscribeGroupDetail = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { messageTopicId } = useParams<{ messageTopicId: string }>();
  const { messageTopics, loading } = useMessageTopics();
  const { openModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { updateMessageTopic } = useUpdateMessageTopic();
  const { deleteMessageTopic, loading: deleting } = useDeleteMessageTopic();
  const isEmailGroupEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  const messageTopic = messageTopics.find(
    (topic) => topic.id === messageTopicId,
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Seed the editable fields once per topic — a refetch (e.g. after a
  // blur-persist of the other field) must not clobber a field the user is
  // still editing, so re-seed only when the topic id actually changes.
  const [seededTopicId, setSeededTopicId] = useState<string | null>(null);

  useEffect(() => {
    if (isDefined(messageTopic) && seededTopicId !== messageTopic.id) {
      setSeededTopicId(messageTopic.id);
      setName(messageTopic.name ?? '');
      setDescription(messageTopic.description ?? '');
    }
  }, [messageTopic, seededTopicId]);

  if (loading) {
    return <SettingsSkeletonLoader />;
  }

  if (!isEmailGroupEnabled || !isDefined(messageTopic)) {
    return <NotFound />;
  }

  const isPublic = messageTopic.visibility === MessageTopicVisibility.PUBLIC;

  const persist = async (input: Parameters<typeof updateMessageTopic>[0]) => {
    try {
      await updateMessageTopic(input);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update unsubscribe group.`,
      });
    }
  };

  const handleNameBlur = () => {
    if (name !== (messageTopic.name ?? '')) {
      persist({ id: messageTopic.id, name });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (messageTopic.description ?? '')) {
      persist({ id: messageTopic.id, description: description || null });
    }
  };

  const handleVisibilityChange = (checked: boolean) => {
    persist({
      id: messageTopic.id,
      visibility: checked
        ? MessageTopicVisibility.PUBLIC
        : MessageTopicVisibility.PRIVATE,
    });
  };

  const handleDelete = async () => {
    try {
      await deleteMessageTopic(messageTopic.id);
      navigateSettings(SettingsPath.WorkspaceEmail);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to delete unsubscribe group.`,
      });
    }
  };

  const groupName = messageTopic.name ?? t`Untitled group`;

  return (
    <SettingsPageLayout
      title={groupName}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Email`,
          href: getSettingsPath(SettingsPath.WorkspaceEmail),
        },
        { children: groupName },
      ]}
      actionButton={
        <Button
          Icon={IconTrash}
          title={t`Delete`}
          variant="secondary"
          accent="danger"
          size="small"
          disabled={deleting}
          onClick={() => openModal(DELETE_UNSUBSCRIBE_GROUP_MODAL_ID)}
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
            value={name}
            onChange={setName}
            onBlur={handleNameBlur}
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
            onBlur={handleDescriptionBlur}
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
              onChange={handleVisibilityChange}
            />
          </Card>
        </Section>
      </SettingsPageContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_UNSUBSCRIBE_GROUP_MODAL_ID}
        title={t`Delete unsubscribe group`}
        subtitle={t`Are you sure you want to delete ${groupName}? Recipients will no longer be able to opt out of this category.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
        loading={deleting}
      />
    </SettingsPageLayout>
  );
};
