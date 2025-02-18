import { SettingsAdminIndicatorHealthStatusContent } from '@/settings/admin-panel/health-status/components/SettingsAdminIndicatorHealthStatusContent';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { H2Title, Section, Status } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  AdminPanelIndicatorHealthStatusInputEnum,
  useGetIndicatorHealthStatusQuery,
} from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledStatusContainer = styled.div``;

export const SettingsAdminIndicatorHealthStatus = () => {
  const { t } = useLingui();
  const { indicatorName } = useParams();
  const { data } = useGetIndicatorHealthStatusQuery({
    variables: {
      indicatorName: indicatorName as AdminPanelIndicatorHealthStatusInputEnum,
    },
    fetchPolicy: 'network-only',
  });

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Server Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Health Status`,
          href: getSettingsPath(SettingsPath.AdminPanelHealthStatus),
        },
        { children: `${indicatorName}` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={`${indicatorName}`} description="Health status" />
          <StyledStatusContainer>
            {indicatorName !==
              AdminPanelIndicatorHealthStatusInputEnum.ACCOUNT_SYNC && (
              <>
                {data?.getIndicatorHealthStatus.status ===
                  AdminPanelHealthServiceStatus.OPERATIONAL && (
                  <Status color="green" text="Operational" weight="medium" />
                )}
                {data?.getIndicatorHealthStatus.status ===
                  AdminPanelHealthServiceStatus.OUTAGE && (
                  <Status color="red" text="Outage" weight="medium" />
                )}
              </>
            )}
          </StyledStatusContainer>
        </Section>

        <SettingsAdminIndicatorHealthStatusContent
          indicatorName={
            indicatorName as AdminPanelIndicatorHealthStatusInputEnum
          }
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
