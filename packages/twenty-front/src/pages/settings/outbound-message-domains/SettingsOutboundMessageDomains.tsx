import { Link } from 'react-router-dom';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';

import { SettingsOutboundMessageDomainRowDropdownMenu } from '@/settings/outbound-message-domains/components/SettingsOutboundMessageDomainRowDropdownMenu';

import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconMail, Status } from 'twenty-ui/display';
import { useGetOutboundMessageDomainsQuery } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { getOutboundMessageDomainStatusColor } from '~/pages/settings/outbound-message-domains/utils/getOutboundMessageDomainStatusColor';
import { getOutboundMessageDomainStatusText } from '~/pages/settings/outbound-message-domains/utils/getOutboundMessageDomainStatusText';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const SettingsOutboundMessageDomains = () => {
  const { t } = useLingui();
  const { localeCatalog } = useRecoilValue(dateLocaleState);
  const navigate = useNavigateSettings();

  const { data, loading: isLoading } = useGetOutboundMessageDomainsQuery();

  const getItemDescription = (createdAt: string) => {
    const beautifyPastDateRelative = beautifyPastDateRelativeToNow(
      createdAt,
      localeCatalog,
    );
    return t`Added ${beautifyPastDateRelative}`;
  };

  if (isDefined(isLoading)) {
    <StyledLink to={getSettingsPath(SettingsPath.NewOutboundMessageDomain)}>
      <SettingsCard
        title={t`Add Outbound Message Domain`}
        description={t`Configure domains for sending outbound emails from this workspace.`}
        Icon={<IconMail />}
      />
    </StyledLink>;
  }

  return (
    <>
      <SettingsListCard
        items={data?.getOutboundMessageDomains ?? []}
        getItemLabel={({ domain }) => domain ?? ''}
        getItemDescription={({ createdAt }) => getItemDescription(createdAt)}
        RowIcon={IconMail}
        RowRightComponent={({ item: outboundMessageDomain }) => (
          <>
            <Status
              color={getOutboundMessageDomainStatusColor(
                outboundMessageDomain.status,
              )}
              text={getOutboundMessageDomainStatusText(
                outboundMessageDomain.status,
              )}
            />
            <SettingsOutboundMessageDomainRowDropdownMenu
              outboundMessageDomain={outboundMessageDomain}
            />
          </>
        )}
        to={(outboundMessageDomain) =>
          getSettingsPath(SettingsPath.OutboundMessageDomainDetail).replace(
            ':domainId',
            outboundMessageDomain.id,
          )
        }
        hasFooter
        footerButtonLabel="Add Outbound Message Domain"
        onFooterButtonClick={() => {
          navigate(SettingsPath.NewOutboundMessageDomain);
        }}
      />
    </>
  );
};
