import { SettingsAdminEnvVariablesTable } from '@/settings/admin-panel/components/SettingsAdminEnvVariablesTable';
import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { SettingsListItemCardContent } from '@/settings/components/SettingsListItemCardContent';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Banner,
  Button,
  Card,
  H2Title,
  IconExternalLink,
  IconHeartRateMonitor,
  IconInfoCircle,
  Section,
} from 'twenty-ui';
import { useGetEnvironmentVariablesGroupedQuery } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledGroupContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledBanner = styled(Banner)`
  align-items: center;
  background-color: ${({ theme }) => theme.color.blueAccent20};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledBannerContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledBannerText = styled.div`
  color: ${({ theme }) => theme.color.blue};
`;

export const SettingsAdminEnvVariables = () => {
  const theme = useTheme();
  const { data: environmentVariables, loading: environmentVariablesLoading } =
    useGetEnvironmentVariablesGroupedQuery({
      fetchPolicy: 'network-only',
    });

  const visibleGroups =
    environmentVariables?.getEnvironmentVariablesGrouped.groups.filter(
      (group) => !group.isHiddenOnLoad,
    ) ?? [];

  if (environmentVariablesLoading) {
    return <SettingsAdminTabSkeletonLoader />;
  }

  return (
    <>
      <Section>
        <StyledBanner>
          <StyledBannerContent>
            <IconInfoCircle
              color={theme.color.blue}
              size={theme.icon.size.md}
            />
            <StyledBannerText>
              Worker variables are not defined here
            </StyledBannerText>
          </StyledBannerContent>
          <Button
            variant="tertiary"
            title="Go to Documentation"
            onClick={() =>
              window.open(
                'https://twenty.com/developers/section/self-hosting/setup#setup-environment-variables',
                '_blank',
              )
            }
            size="small"
            accent="blue"
            Icon={IconExternalLink}
          >
            Go to Documentation
          </Button>
        </StyledBanner>
      </Section>
      <Section>
        {visibleGroups.map((group) => (
          <StyledGroupContainer key={group.name}>
            <H2Title title={group.name} description={group.description} />
            {group.variables.length > 0 && (
              <SettingsAdminEnvVariablesTable variables={group.variables} />
            )}
          </StyledGroupContainer>
        ))}

        <Card rounded>
          <SettingsListItemCardContent
            label="Other Variables"
            to={getSettingsPath(SettingsPath.ServerAdminOtherEnvVariables)}
            rightComponent={<></>}
            LeftIcon={IconHeartRateMonitor}
            LeftIconColor={theme.font.color.tertiary}
          />
        </Card>
      </Section>
    </>
  );
};
