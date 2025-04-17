import { SettingsAdminEnvVariablesTable } from '@/settings/admin-panel/components/SettingsAdminEnvVariablesTable';
import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { SettingsListItemCardContent } from '@/settings/components/SettingsListItemCardContent';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title, IconHeartRateMonitor } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { useGetConfigVariablesGroupedQuery } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledGroupContainer = styled.div``;

const StyledInfoText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

export const SettingsAdminEnvVariables = () => {
  const theme = useTheme();
  const { data: configVariables, loading: configVariablesLoading } =
    useGetConfigVariablesGroupedQuery({
      fetchPolicy: 'network-only',
    });

  const visibleGroups =
    configVariables?.getConfigVariablesGrouped.groups.filter(
      (group) => !group.isHiddenOnLoad,
    ) ?? [];

  if (configVariablesLoading) {
    return <SettingsAdminTabSkeletonLoader />;
  }

  return (
    <>
      <Section>
        <StyledInfoText>
          {t`These are only the server values. Ensure your worker environment has the same variables and values, this is required for asynchronous tasks like email sync.`}
        </StyledInfoText>
      </Section>
      {visibleGroups.map((group) => (
        <StyledGroupContainer key={group.name}>
          <H2Title title={group.name} description={group.description} />
          {group.variables.length > 0 && (
            <SettingsAdminEnvVariablesTable variables={group.variables} />
          )}
        </StyledGroupContainer>
      ))}

      <Section>
        <StyledCard rounded>
          <SettingsListItemCardContent
            label={t`Other Variables`}
            to={getSettingsPath(SettingsPath.AdminPanelOtherEnvVariables)}
            rightComponent={null}
            LeftIcon={IconHeartRateMonitor}
            LeftIconColor={theme.font.color.tertiary}
          />
        </StyledCard>
      </Section>
    </>
  );
};
