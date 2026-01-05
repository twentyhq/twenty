import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useWhatsappConnectionForm } from '@/settings/integrations/hooks/useWhatsappConnectionForm';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsIntegrationsWhatsappConnectionForm } from '@/settings/integrations/components/SettingsIntegrationsWhatsappConnectionForm';

export const SettingsIntegrationsWhatsapp = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const {
    formMethods,
    handleSave,
    handleSubmit,
    canSave,
    isSubmitting,
    loading,
  } = useWhatsappConnectionForm({});

  const { control } = formMethods;
  return (
    <SubMenuTopBarContainer
      title={`WhatsApp`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Integrations`,
          href: getSettingsPath(SettingsPath.Integrations),
        },
        {
          children: `WhatsApp`,
        },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={isSubmitting}
          isLoading={loading}
          onCancel={() => navigate(SettingsPath.Integrations)}
          onSave={handleSubmit((data) => handleSave(data))}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsIntegrationsWhatsappConnectionForm
          control={control}
          isEditing={false}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
