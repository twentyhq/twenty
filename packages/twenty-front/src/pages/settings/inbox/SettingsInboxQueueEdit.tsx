import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/components';
import { useToast } from 'twenty-ui/primitives/feedback';

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
  const { enqueueToast } = useToast();
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
          label: inboxQueue.label,
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
          <Section.Root>
            <Section.Header title={t`This shared inbox no longer exists`} />
          </Section.Root>
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
        label: draft.label.trim(),
        icon: draft.icon,
      });
      await setInboxQueueRoles({
        queueId: inboxQueue.id,
        roleIds: draft.roleIds,
      });
      goBack();
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`This shared inbox could not be saved`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInboxQueue(inboxQueue.id);
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`This shared inbox could not be deleted`,
      });

      return;
    }

    goBack();
  };

  return (
    <SettingsPageLayout
      title={inboxQueue.label}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: inboxQueue.label },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onSave={handleSave}
          onCancel={goBack}
          isSaveDisabled={draft.label.trim().length === 0}
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
          <Section.Root>
            <Section.Header
              title={t`Danger zone`}
              description={t`Work still in this inbox moves to Triage rather than being deleted`}
            />
            <Button
              startIcon={<IconTrash />}
              color="danger"
              size="sm"
              variant="outline"
              onClick={() => openModal(DELETE_INBOX_QUEUE_MODAL_ID)}
            >
              {t`Delete shared inbox`}
            </Button>
          </Section.Root>
        )}
      </SettingsPageContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_INBOX_QUEUE_MODAL_ID}
        title={t`Delete ${inboxQueue.label}`}
        subtitle={t`Everyone loses access to this inbox. Work still in it moves to Triage.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        confirmButtonColor="danger"
      />
    </SettingsPageLayout>
  );
};
