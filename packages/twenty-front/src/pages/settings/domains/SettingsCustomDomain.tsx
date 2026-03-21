/* @license Enterprise */
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsCustomDomain as SettingsCustomDomainInput } from '@/settings/domains/components/SettingsCustomDomain';
import { useSettingsCustomDomain } from '@/settings/domains/hooks/useSettingsCustomDomain';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsCustomDomain = () => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();

  const {
    customDomain,
    error,
    isSubmitting,
    isSaveDisabled,
    handleChange,
    handleDelete,
    handleSave,
  } = useSettingsCustomDomain();

  return (
    <SubMenuTopBarContainer
      title={t`Custom Domain`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Domains</Trans>,
          href: getSettingsPath(SettingsPath.Domains),
        },
        { children: <Trans>Custom Domain</Trans> },
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
        <SettingsCustomDomainInput
          value={customDomain}
          onChange={handleChange}
          onDelete={handleDelete}
          error={error}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
