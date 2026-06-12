import { useLingui } from '@lingui/react/macro';
import { useQuery } from '@apollo/client/react';

import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsEmailingDomainNameCell } from '@/settings/emailing-domains/components/SettingsEmailingDomainNameCell';
import { SettingsEmailingDomainStatusCell } from '@/settings/emailing-domains/components/SettingsEmailingDomainStatusCell';
import { SettingsPath } from 'twenty-shared/types';
import {
  type GetEmailingDomainsQuery,
  GetEmailingDomainsDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type EmailingDomain = GetEmailingDomainsQuery['getEmailingDomains'][0];

export const SettingsWorkspaceEmailingDomainsSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  const { data } = useQuery(GetEmailingDomainsDocument);
  const emailingDomains = data?.getEmailingDomains ?? [];

  return (
    <SettingsTableListSection<EmailingDomain>
      title={t`Emailing Domains`}
      description={t`Verify domains so the workspace can send outbound email through them.`}
      items={emailingDomains}
      columns={[
        { label: t`Domain`, Cell: SettingsEmailingDomainNameCell },
        {
          label: t`Status`,
          align: 'right',
          Cell: SettingsEmailingDomainStatusCell,
        },
      ]}
      gridAutoColumns="1fr 1fr"
      onRowClick={(emailingDomain) =>
        navigateSettings(SettingsPath.EmailingDomainDetail, {
          domainId: emailingDomain.id,
        })
      }
      footerButtonLabel={t`Add emailing domain`}
      onFooterButtonClick={() =>
        navigateSettings(SettingsPath.NewEmailingDomain)
      }
    />
  );
};
