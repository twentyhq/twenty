import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import {
  type InboxQueueDraft,
  SettingsInboxQueueForm,
} from '@/settings/inbox/components/SettingsInboxQueueForm';
import { useInboxSettings } from '@/settings/inbox/hooks/useInboxSettings';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const DELETE_INBOX_QUEUE_MODAL_ID = 'delete-inbox-queue';

export const SettingsInboxQueueEdit = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { queueId } = useParams<{ queueId?: string }>();
  const { openModal } = useModal();
  const {
    inboxQueues,
    loading,
    updateInboxQueue,
    setInboxQueueRoles,
    deleteInboxQueue,
  } = useInboxSettings();

  const inboxQueue = inboxQueues.find(({ id }) => id === queueId);

  const [editedQueue, setEditedQueue] = useState<{
    queueId: string;
    draft: InboxQueueDraft;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Derived rather than synced: the draft is whatever has been edited for this
  // queue, falling back to what the server says. Edits carry the queue they
  // were made against, so navigating between two shared inboxes cannot save one
  // into the other and there is no window where the two disagree.
  const draft = !isDefined(inboxQueue)
    ? null
    : isDefined(editedQueue) && editedQueue.queueId === inboxQueue.id
      ? editedQueue.draft
      : {
          name: inboxQueue.name,
          icon: inboxQueue.icon ?? 'IconInbox',
          roleIds: inboxQueue.roleIds,
        };

  const goBack = () => navigateSettings(SettingsPath.WorkspaceCommunications);

  if (!loading && !isDefined(inboxQueue)) {
    return (
      <SettingsPageLayout
        title={t`Shared inbox`}
        links={[
          {
            children: t`Communication`,
            href: getSettingsPath(SettingsPath.WorkspaceCommunications),
          },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            <H2Title title={t`This shared inbox no longer exists`} />
          </Section>
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
  }

  if (!isDefined(inboxQueue) || !isDefined(draft)) {
    return <></>;
  }

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await updateInboxQueue({
        queueId: inboxQueue.id,
        name: draft.name.trim(),
        icon: draft.icon,
      });
      await setInboxQueueRoles({
        queueId: inboxQueue.id,
        roleIds: draft.roleIds,
      });
      goBack();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteInboxQueue(inboxQueue.id);
    goBack();
  };

  return (
    <SettingsPageLayout
      title={inboxQueue.name}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: inboxQueue.name },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onSave={handleSave}
          onCancel={goBack}
          isSaveDisabled={draft.name.trim().length === 0}
          isLoading={isSaving}
        />
      }
    >
      <SettingsRolesQueryEffect />
      <SettingsPageContainer>
        <SettingsInboxQueueForm
          draft={draft}
          onChange={(nextDraft) =>
            setEditedQueue({ queueId: inboxQueue.id, draft: nextDraft })
          }
        />
        {!inboxQueue.isDefault && (
          <Section>
            <H2Title
              title={t`Danger zone`}
              description={t`Work still in this inbox moves to Triage rather than being deleted`}
            />
            <Button
              Icon={IconTrash}
              title={t`Delete shared inbox`}
              accent="danger"
              size="small"
              onClick={() => openModal(DELETE_INBOX_QUEUE_MODAL_ID)}
            />
          </Section>
        )}
      </SettingsPageContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_INBOX_QUEUE_MODAL_ID}
        title={t`Delete ${inboxQueue.name}`}
        subtitle={t`Everyone loses access to this inbox. Work still in it moves to Triage.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
      />
    </SettingsPageLayout>
  );
};
