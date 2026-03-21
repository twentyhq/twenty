import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSubdomain as SettingsSubdomainInput } from '@/settings/domains/components/SettingsSubdomain';
import {
  SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID,
  useSettingsSubdomain,
} from '@/settings/domains/hooks/useSettingsSubdomain';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsSubdomain = () => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();

  const {
    subdomain,
    error,
    isSubmitting,
    isSaveDisabled,
    handleChange,
    handleSave,
    handleConfirm,
  } = useSettingsSubdomain();

  return (
    <>
      <SubMenuTopBarContainer
        title={t`Subdomain`}
        links={[
          {
            children: <Trans>Workspace</Trans>,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: <Trans>Domains</Trans>,
            href: getSettingsPath(SettingsPath.Domains),
          },
          { children: <Trans>Subdomain</Trans> },
        ]}
        actionButton={
          <SaveAndCancelButtons
            onCancel={() => navigate(SettingsPath.Domains)}
            isSaveDisabled={isSaveDisabled}
            isLoading={isSubmitting}
            onSave={handleSave}
          />
        }
      >
        <SettingsPageContainer>
          <SettingsSubdomainInput
            value={subdomain}
            onChange={handleChange}
            error={error}
          />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
      <ConfirmationModal
        modalInstanceId={SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID}
        title={t`Change subdomain?`}
        subtitle={t`You're about to change your workspace subdomain. This action will log out all users.`}
        onConfirmClick={handleConfirm}
      />
    </>
  );
};
