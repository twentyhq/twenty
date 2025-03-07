import { SettingsAdminEnvVariablesTable } from '@/settings/admin-panel/components/SettingsAdminEnvVariablesTable';
import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import styled from '@emotion/styled';
import { useState } from 'react';
import { Button, H1Title, H1TitleFontColor, H2Title, Section } from 'twenty-ui';
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

export const SettingsAdminEnvVariables = () => {
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
        These are only the server values. Ensure your worker environment has the
        same variables and values, this is required for asynchronous tasks like
        email sync.
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
