import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

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

export const SettingsInboxQueueNew = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { createInboxQueue } = useInboxSettings();

  const [draft, setDraft] = useState<InboxQueueDraft>({
    name: '',
    icon: 'IconInbox',
    roleIds: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const goBack = () => navigateSettings(SettingsPath.WorkspaceCommunications);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await createInboxQueue({
        name: draft.name.trim(),
        icon: draft.icon,
        roleIds: draft.roleIds,
      });
      goBack();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsPageLayout
      title={t`New shared inbox`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: t`New` },
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
        <SettingsInboxQueueForm draft={draft} onChange={setDraft} />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
