import { Link, useNavigate } from 'react-router-dom';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';

import { SettingsOutboundMessageDomainRowDropdownMenu } from '@/settings/outbound-message-domains/components/SettingsOutboundMessageDomainRowDropdownMenu';

import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconMail, Status } from 'twenty-ui/display';
import { useGetOutboundMessageDomainsQuery } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { getColorByOutboundMessageDomainStatus } from '~/pages/settings/outbound-message-domains/utils/getOutboundMessageDomainStatusColor';
import { getTextByOutboundMessageDomainStatus } from '~/pages/settings/outbound-message-domains/utils/getOutboundMessageDomainStatusText';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const SettingsOutboundMessageDomains = () => {
  const { t } = useLingui();
  const { localeCatalog } = useRecoilValue(dateLocaleState);
  const navigate = useNavigate();

  const { data, loading: isLoading } = useGetOutboundMessageDomainsQuery();
  const outboundMessageDomains = data?.getOutboundMessageDomains ?? [];

  const getItemDescription = (createdAt: string) => {
    const beautifyPastDateRelative = beautifyPastDateRelativeToNow(
      createdAt,
      localeCatalog,
    );
    return t`Added ${beautifyPastDateRelative}`;
  };

  return isLoading || !outboundMessageDomains.length ? (
    <StyledLink to={getSettingsPath(SettingsPath.NewOutboundMessageDomain)}>
      <SettingsCard
        title={t`Add Outbound Message Domain`}
        Icon={<IconMail />}
      />
    </StyledLink>
  ) : (
    <>
      <SettingsListCard
        items={outboundMessageDomains}
        getItemLabel={({ domain }) => domain ?? ''}
        getItemDescription={({ createdAt }) => getItemDescription(createdAt)}
        RowIcon={IconMail}
        RowRightComponent={({ item: outboundMessageDomain }) => (
          <>
            <Status
              color={getColorByOutboundMessageDomainStatus(
                outboundMessageDomain.status,
              )}
              text={getTextByOutboundMessageDomainStatus(
                outboundMessageDomain.status,
              )}
            />
            <SettingsOutboundMessageDomainRowDropdownMenu
              outboundMessageDomain={outboundMessageDomain}
            />
          </>
        )}
        hasFooter
        footerButtonLabel="Add Outbound Message Domain"
        onFooterButtonClick={() =>
          navigate(getSettingsPath(SettingsPath.NewOutboundMessageDomain))
        }
      />
    </>
  );
};
