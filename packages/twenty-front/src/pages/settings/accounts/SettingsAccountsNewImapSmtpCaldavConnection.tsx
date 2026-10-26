import { useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsSaveAndCancelPageCommands } from '@/settings/page-commands/components/SettingsSaveAndCancelPageCommands';
import { SettingsPath } from 'twenty-shared/types';

import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { SettingsAccountsConnectionForm } from '@/settings/accounts/components/SettingsAccountsConnectionForm';
import { useImapSmtpCaldavConnectionForm } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';

export const SettingsAccountsNewImapSmtpCaldavConnection = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();

  const {
    formMethods,
    handleSave,
    handleSubmit,
    canSave,
    isSubmitting,
    loading,
  } = useImapSmtpCaldavConnectionForm({});

  const { control } = formMethods;

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <SettingsPageLayout
        title={t`New Account`}
        links={[
          {
            children: t`User`,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: t`Accounts`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: t`New Account` },
        ]}
        pageCommands={
          <SettingsSaveAndCancelPageCommands
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
      </SettingsPageLayout>
    </FormProvider>
  );
};
