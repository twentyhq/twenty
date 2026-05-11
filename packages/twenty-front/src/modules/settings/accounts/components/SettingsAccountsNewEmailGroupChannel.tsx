import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import { useCreateEmailGroupChannel } from '@/settings/accounts/hooks/useCreateEmailGroupChannel';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsAccountsNewEmailGroupChannel = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { createEmailGroupChannel, loading } = useCreateEmailGroupChannel();

  const [handle, setHandle] = useState('');

  const isHandleValidEmail = z.email().safeParse(handle).success;
  const canSave = isHandleValidEmail && !loading;

  const handleSave = useCallback(async () => {
    try {
      const result = await createEmailGroupChannel(handle);
      const messageChannelId =
        result.data?.createEmailGroupChannel.messageChannel.id;

      if (messageChannelId) {
        navigate(SettingsPath.EmailGroupChannelDetail, {
          messageChannelId,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to create email group channel. Email group may not be configured on this server.`,
      });
    }
  }, [createEmailGroupChannel, handle, navigate, enqueueErrorSnackBar, t]);

  return (
    <SubMenuTopBarContainer
      title={t`New Email Group`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`General`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`New Email Group` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={loading}
          isLoading={loading}
          onCancel={() => navigate(SettingsPath.Workspace)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Email Address`}
            description={t`Enter the email address you want to forward emails from (e.g. support@mycompany.com).`}
          />
          <SettingsTextInput
            instanceId="email-group-handle"
            label={t`Source Email Address`}
            placeholder="support@mycompany.com"
            value={handle}
            onChange={setHandle}
            disabled={loading}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
