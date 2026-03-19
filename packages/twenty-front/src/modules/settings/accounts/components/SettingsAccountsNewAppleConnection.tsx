import { useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';

import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { SettingsAccountsConnectionForm } from '@/settings/accounts/components/SettingsAccountsConnectionForm';
import { useImapSmtpCaldavConnectionForm } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';

const APPLE_IMAP_HOST = 'imap.mail.me.com';
const APPLE_SMTP_HOST = 'smtp.mail.me.com';
const APPLE_CALDAV_HOST = 'caldav.icloud.com';

export const SettingsAccountsNewAppleConnection = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();

  const {
    formMethods,
    handleSave,
    handleSubmit,
    canSave,
    isSubmitting,
    loading,
  } = useImapSmtpCaldavConnectionForm({
    initialValues: {
      IMAP: { host: APPLE_IMAP_HOST, port: 993, password: '', secure: true },
      SMTP: {
        host: APPLE_SMTP_HOST,
        port: 587,
        username: '',
        password: '',
        secure: false,
      },
      CALDAV: {
        host: APPLE_CALDAV_HOST,
        port: 443,
        password: '',
        secure: true,
        username: undefined,
      },
    },
  });

  const { control } = formMethods;

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <SubMenuTopBarContainer
        title={t`Connect Apple Account`}
        links={[
          {
            children: t`User`,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: t`Accounts`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: t`Connect Apple Account` },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            isLoading={loading}
            onCancel={() => navigate(SettingsPath.Accounts)}
            onSave={handleSubmit((data) => handleSave(data))}
          />
        }
      >
        <SettingsPageContainer>
          <SettingsAccountsConnectionForm control={control} isEditing={false} />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
