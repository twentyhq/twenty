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

  const [draft, setDraft] = useState<InboxQueueDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // The draft only exists once the queue has loaded, so it is seeded here
  // rather than held as derived state that could disagree with the server
  useEffect(() => {
    if (isDefined(inboxQueue) && !isDefined(draft)) {
      setDraft({
        name: inboxQueue.name,
        icon: inboxQueue.icon ?? 'IconInbox',
        memberUserWorkspaceIds: inboxQueue.memberUserWorkspaceIds,
      });
    }
  }, [inboxQueue, draft]);

  const goBack = () => navigateSettings(SettingsPath.Inbox);

  if (!loading && !isDefined(inboxQueue)) {
    return (
      <SettingsPageLayout
        title={t`Shared inbox`}
        links={[
          { children: t`Inbox`, href: getSettingsPath(SettingsPath.Inbox) },
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
        memberUserWorkspaceIds: draft.memberUserWorkspaceIds,
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
        { children: t`Inbox`, href: getSettingsPath(SettingsPath.Inbox) },
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
        <SettingsInboxQueueForm draft={draft} onChange={setDraft} />
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
