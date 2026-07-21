import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';

import { useCreateEmailGroupChannel } from '@/settings/accounts/hooks/useCreateEmailGroupChannel';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsAccountsNewEmailGroupChannel = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { createEmailGroupChannel, loading } = useCreateEmailGroupChannel();

  const [handle, setHandle] = useState('');

  const isHandleValidEmail = z.email().safeParse(handle).success;
  const canSave = isHandleValidEmail && !loading;

  const handleSave = useCallback(async () => {
    const result = await createEmailGroupChannel(handle);
    const messageChannelId =
      result.data?.createEmailGroupChannel.messageChannel.id;

    if (messageChannelId) {
      navigate(SettingsPath.EmailGroupChannelDetail, {
        messageChannelId,
      });
    }
  }, [createEmailGroupChannel, handle, navigate]);

  return (
    <SettingsPageLayout
      title={t`New Email Channel`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: t`New Email Channel` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={loading}
          isLoading={loading}
          onCancel={() => navigate(SettingsPath.WorkspaceCommunications)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Email Address`}
            description={t`The address your workspace will send and receive email from (e.g. support@mycompany.com). Outbound sending requires the domain to be verified in Outbound Domains.`}
          />
          <SettingsTextInput
            instanceId="email-group-source"
            label={t`Source Email Address`}
            placeholder="support@mycompany.com"
            value={handle}
            onChange={setHandle}
            onInputEnter={() => {
              if (canSave) {
                handleSave();
              }
            }}
            disabled={loading}
          />
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
