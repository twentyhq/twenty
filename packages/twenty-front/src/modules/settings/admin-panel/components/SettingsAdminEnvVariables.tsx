import { SettingsAdminEnvVariablesTable } from '@/settings/admin-panel/components/SettingsAdminEnvVariablesTable';
import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  Banner,
  Button,
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconExternalLink,
  IconInfoCircle,
  Section,
} from 'twenty-ui';
import { useGetEnvironmentVariablesGroupedQuery } from '~/generated/graphql';

const StyledGroupContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledGroupDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledShowMoreButton = styled(Button)<{ isSelected?: boolean }>`
  ${({ isSelected, theme }) =>
    isSelected &&
    `
    background-color: ${theme.background.transparent.light};
  `}
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

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const toggleGroupVisibility = (groupName: string) => {
    setSelectedGroup(selectedGroup === groupName ? null : groupName);
  };

  const hiddenGroups =
    environmentVariables?.getEnvironmentVariablesGrouped.groups.filter(
      (group) => group.isHiddenOnLoad,
    ) ?? [];

  const visibleGroups =
    environmentVariables?.getEnvironmentVariablesGrouped.groups.filter(
      (group) => !group.isHiddenOnLoad,
    ) ?? [];

  const selectedGroupData =
    environmentVariables?.getEnvironmentVariablesGrouped.groups.find(
      (group) => group.name === selectedGroup,
    );

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

        {hiddenGroups.length > 0 && (
          <>
            <StyledButtonsRow>
              {hiddenGroups.map((group) => (
                <StyledShowMoreButton
                  key={group.name}
                  onClick={() => toggleGroupVisibility(group.name)}
                  title={group.name}
                  variant="secondary"
                  isSelected={selectedGroup === group.name}
                >
                  {group.name} variables
                </StyledShowMoreButton>
              ))}
            </StyledButtonsRow>

            {selectedGroupData && (
              <StyledGroupContainer>
                <H1Title
                  title={selectedGroupData.name}
                  fontColor={H1TitleFontColor.Primary}
                />
                {selectedGroupData.description !== '' && (
                  <StyledGroupDescription>
                    {selectedGroupData.description}
                  </StyledGroupDescription>
                )}
                {selectedGroupData.variables.length > 0 && (
                  <SettingsAdminEnvVariablesTable
                    variables={selectedGroupData.variables}
                  />
                )}
              </StyledGroupContainer>
            )}
          </>
        )}
      </Section>
    </>
  );
};
