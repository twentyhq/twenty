import { Link, useNavigate } from 'react-router-dom';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';

import { SettingsEmailingDomainRowDropdownMenu } from '@/settings/emailing-domains/components/SettingsEmailingDomainRowDropdownMenu';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconMail, Status } from 'twenty-ui/display';
import { useQuery } from '@apollo/client/react';
import { GetEmailingDomainsDocument } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledLinkContainer = styled.div`
  > a {
    text-decoration: none;
  }
`;

export const SettingsEmailingDomains = () => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const navigate = useNavigate();

  const { data, loading: isLoading } = useQuery(GetEmailingDomainsDocument);
  const emailingDomains = data?.getEmailingDomains ?? [];

  const getItemDescription = (createdAt: string) => {
    const beautifyPastDateRelative = beautifyPastDateRelativeToNow(
      createdAt,
      localeCatalog,
    );
    return t`Added ${beautifyPastDateRelative}`;
  };

  return isLoading || !emailingDomains.length ? (
    <StyledLinkContainer>
      <Link to={getSettingsPath(SettingsPath.NewEmailingDomain)}>
        <SettingsCard title={t`Add Emailing Domain`} Icon={<IconMail />} />
      </Link>
    </StyledLinkContainer>
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
