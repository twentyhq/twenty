import { Link, useNavigate } from 'react-router-dom';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';

import { SettingsEmailingDomainRowDropdownMenu } from '@/settings/emailing-domains/components/SettingsEmailingDomainRowDropdownMenu';

import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconMail, Status } from 'twenty-ui/display';
import { useGetEmailingDomainsQuery } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const SettingsEmailingDomains = () => {
  const { t } = useLingui();
  const { localeCatalog } = useRecoilValue(dateLocaleState);
  const navigate = useNavigate();

  const { data, loading: isLoading } = useGetEmailingDomainsQuery();
  const emailingDomains = data?.getEmailingDomains ?? [];

  const getItemDescription = (createdAt: string) => {
    const beautifyPastDateRelative = beautifyPastDateRelativeToNow(
      createdAt,
      localeCatalog,
    );
    return t`Added ${beautifyPastDateRelative}`;
  };

  return isLoading || !emailingDomains.length ? (
    <StyledLink to={getSettingsPath(SettingsPath.NewEmailingDomain)}>
      <SettingsCard title={t`Add Emailing Domain`} Icon={<IconMail />} />
    </StyledLink>
  ) : (
    <>
      <SettingsListCard
        items={emailingDomains}
        getItemLabel={({ domain }) => domain ?? ''}
        getItemDescription={({ createdAt }) => getItemDescription(createdAt)}
        RowIcon={IconMail}
        onRowClick={(emailingDomain) => {
          navigate(
            getSettingsPath(SettingsPath.EmailingDomainDetail, {
              domainId: emailingDomain.id,
            }),
          );
        }}
        RowRightComponent={({ item: emailingDomain }) => (
          <>
            <Status
              color={getColorByEmailingDomainStatus(emailingDomain.status)}
              text={getTextByEmailingDomainStatus(emailingDomain.status)}
            />
            <SettingsEmailingDomainRowDropdownMenu
              emailingDomain={emailingDomain}
            />
          </>
        )}
        hasFooter
        footerButtonLabel={t`Add Emailing Domain`}
        onFooterButtonClick={() =>
          navigate(getSettingsPath(SettingsPath.NewEmailingDomain))
        }
      />
    </>
  );
};
