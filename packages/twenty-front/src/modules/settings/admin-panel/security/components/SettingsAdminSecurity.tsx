import { SettingsAdminSigningKeysTable } from '@/settings/admin-panel/security/components/SettingsAdminSigningKeysTable';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsAdminSecurity = () => {
  return (
    <Section>
      <H2Title
        title={t`Signing Keys`}
        description={t`Asymmetric public keys used to sign and verify access tokens. Revoking a key immediately invalidates every JWT signed with it.`}
      />
      <SettingsAdminSigningKeysTable />
    </Section>
  );
};
