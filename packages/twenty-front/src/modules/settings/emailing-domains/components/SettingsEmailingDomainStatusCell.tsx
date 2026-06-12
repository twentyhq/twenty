import { type GetEmailingDomainsQuery } from '~/generated-metadata/graphql';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';
import { Status } from 'twenty-ui-deprecated/display';

type SettingsEmailingDomainStatusCellProps = {
  item: GetEmailingDomainsQuery['getEmailingDomains'][0];
};

export const SettingsEmailingDomainStatusCell = ({
  item,
}: SettingsEmailingDomainStatusCellProps) => (
  <Status
    color={getColorByEmailingDomainStatus(item.status)}
    text={getTextByEmailingDomainStatus(item.status)}
  />
);
