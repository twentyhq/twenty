import { FormProvider } from 'react-hook-form';

import { SetttingsAccountsImapConnectionForm } from '@/settings/accounts/components/SetttingsAccountsImapConnectionForm';
import { useImapConnectionForm } from '@/settings/accounts/hooks/useImapConnectionForm';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAccountsNewImapConnection = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();

  const { formMethods, handleSave, handleSubmit, canSave, isSubmitting } =
    useImapConnectionForm();

  const { control } = formMethods;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <SubMenuTopBarContainer
        title={t`New IMAP Connection`}
        links={[
          {
            children: t`Settings`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Email Connections`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: t`New IMAP Connection` },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            onCancel={() => navigate(SettingsPath.Accounts)}
            onSave={handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <SetttingsAccountsImapConnectionForm
            control={control}
            isEditing={false}
          />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
