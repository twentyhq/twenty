import { SettingsAdminEnvVariablesTable } from '@/settings/admin-panel/components/SettingsAdminEnvVariablesTable';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { useGetConfigVariablesGroupedQuery } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledGroupContainer = styled.div``;

export const SettingsAdminSecondaryEnvVariables = () => {
  const {
    data: secondaryConfigVariables,
    loading: secondaryConfigVariablesLoading,
  } = useGetConfigVariablesGroupedQuery({
    fetchPolicy: 'network-only',
  });

  const hiddenGroups =
    secondaryConfigVariables?.getConfigVariablesGrouped.groups.filter(
      (group) => group.isHiddenOnLoad,
    ) ?? [];

  if (secondaryConfigVariablesLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <SubMenuTopBarContainer
      title={t`Other Environment Variables`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Other Environment Variables`,
        },
      ]}
    >
      <SettingsPageContainer>
        {hiddenGroups.map((group) => (
          <StyledGroupContainer key={group.name}>
            <H2Title title={group.name} description={group.description} />
            {group.variables.length > 0 && (
              <SettingsAdminEnvVariablesTable variables={group.variables} />
            )}
          </StyledGroupContainer>
        ))}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
