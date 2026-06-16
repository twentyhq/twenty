import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useDeleteUnsubscribeTopic } from '@/settings/unsubscribe-topics/hooks/useDeleteUnsubscribeTopic';
import { useUpdateUnsubscribeTopic } from '@/settings/unsubscribe-topics/hooks/useUpdateUnsubscribeTopic';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { UnsubscribeTopicVisibility } from '~/generated-metadata/graphql';
import { H2Title, IconEye, IconTrash } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { Card, Section } from 'twenty-ui-deprecated/layout';
import { NotFound } from '~/pages/not-found/NotFound';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_UNSUBSCRIBE_TOPIC_MODAL_ID = 'delete-unsubscribe-topic-modal';

export const SettingsWorkspaceUnsubscribeTopicDetail = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { unsubscribeTopicId } = useParams<{ unsubscribeTopicId: string }>();
  const { unsubscribeTopics, loading } = useUnsubscribeTopics();
  const { openModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { updateUnsubscribeTopic } = useUpdateUnsubscribeTopic();
  const { deleteUnsubscribeTopic, loading: deleting } =
    useDeleteUnsubscribeTopic();
  const isEmailGroupEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  const unsubscribeTopic = unsubscribeTopics.find(
    (topic) => topic.id === unsubscribeTopicId,
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seededTopicId, setSeededTopicId] = useState<string | null>(null);

  useEffect(() => {
    if (isDefined(unsubscribeTopic) && seededTopicId !== unsubscribeTopic.id) {
      setSeededTopicId(unsubscribeTopic.id);
      setName(unsubscribeTopic.name ?? '');
      setDescription(unsubscribeTopic.description ?? '');
    }
  }, [unsubscribeTopic, seededTopicId]);

  if (loading) {
    return <SettingsSkeletonLoader />;
  }

  if (!isEmailGroupEnabled || !isDefined(unsubscribeTopic)) {
    return <NotFound />;
  }

  const isPublic =
    unsubscribeTopic.visibility === UnsubscribeTopicVisibility.PUBLIC;

  const persist = async (
    input: Parameters<typeof updateUnsubscribeTopic>[0],
  ) => {
    try {
      await updateUnsubscribeTopic(input);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update unsubscribe topic.`,
      });
    }
  };

  const handleNameBlur = () => {
    if (name !== (unsubscribeTopic.name ?? '')) {
      persist({ id: unsubscribeTopic.id, name });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (unsubscribeTopic.description ?? '')) {
      persist({ id: unsubscribeTopic.id, description: description || null });
    }
  };

  const handleVisibilityChange = (checked: boolean) => {
    persist({
      id: unsubscribeTopic.id,
      visibility: checked
        ? UnsubscribeTopicVisibility.PUBLIC
        : UnsubscribeTopicVisibility.PRIVATE,
    });
  };

  const handleDelete = async () => {
    try {
      await deleteUnsubscribeTopic(unsubscribeTopic.id);
      navigateSettings(SettingsPath.WorkspaceEmail);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to delete unsubscribe topic.`,
      });
    }
  };

  const topicName = unsubscribeTopic.name ?? t`Untitled topic`;

  return (
    <SettingsPageLayout
      title={topicName}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Email`,
          href: getSettingsPath(SettingsPath.WorkspaceEmail),
        },
        { children: topicName },
      ]}
      actionButton={
        <Button
          Icon={IconTrash}
          title={t`Delete`}
          variant="secondary"
          accent="danger"
          size="small"
          disabled={deleting}
          onClick={() => openModal(DELETE_UNSUBSCRIBE_TOPIC_MODAL_ID)}
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
            instanceId="unsubscribe-topic-description"
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
            description={t`Control whether recipients can find and manage this topic.`}
          />
          <Card rounded>
            <SettingsOptionCardContentToggle
              Icon={IconEye}
              title={t`Listed on the unsubscribe page`}
              description={t`Public topics appear on the recipient preferences page.`}
              checked={isPublic}
              onChange={handleVisibilityChange}
            />
          </Card>
        </Section>
      </SettingsPageContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_UNSUBSCRIBE_TOPIC_MODAL_ID}
        title={t`Delete unsubscribe topic`}
        subtitle={t`Are you sure you want to delete ${topicName}? Recipients will no longer be able to opt out of this category.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
        loading={deleting}
      />
    </SettingsPageLayout>
  );
};
