import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
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
    setInboxQueueMembers,
    deleteInboxQueue,
  } = useInboxSettings();

  const inboxQueue = inboxQueues.find(({ id }) => id === queueId);

  const [editedQueue, setEditedQueue] = useState<{
    queueId: string;
    draft: InboxQueueDraft;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // The draft only exists once the queue has loaded, so it is seeded here
  // rather than held as derived state that could disagree with the server. It
  // carries the queue it was seeded from, because navigating between two shared
  // inboxes reuses this component and would otherwise save one into the other.
  useEffect(() => {
    if (isDefined(inboxQueue) && editedQueue?.queueId !== inboxQueue.id) {
      setEditedQueue({
        queueId: inboxQueue.id,
        draft: {
          name: inboxQueue.name,
          icon: inboxQueue.icon ?? 'IconInbox',
          memberWorkspaceMemberIds: inboxQueue.memberWorkspaceMemberIds,
        },
      });
    }
  }, [inboxQueue, editedQueue]);

  const draft = editedQueue?.draft ?? null;

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
      await setInboxQueueMembers({
        queueId: inboxQueue.id,
        memberWorkspaceMemberIds: draft.memberWorkspaceMemberIds,
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
