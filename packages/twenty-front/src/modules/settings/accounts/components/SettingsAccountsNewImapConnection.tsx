import { useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

import { useImapSmtpCaldavConnectionForm } from '../hooks/useImapSmtpCaldavConnectionForm';
import { SettingsAccountsConnectionForm } from './SettingsAccountsConnectionForm';

export const SettingsAccountsNewImapConnection = () => {
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
    connectionType: 'IMAP',
  });

  const { control } = formMethods;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <SubMenuTopBarContainer
        title={t`New IMAP Connection`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Accounts`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: t`New IMAP Connection` },
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
          <SettingsAccountsConnectionForm
            control={control}
            connectionType="IMAP"
            isEditing={false}
          />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
