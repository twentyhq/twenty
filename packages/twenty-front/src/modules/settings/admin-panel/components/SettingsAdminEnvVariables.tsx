import { SettingsAdminEnvVariablesTable } from '@/settings/admin-panel/components/SettingsAdminEnvVariablesTable';
import styled from '@emotion/styled';
import { useState } from 'react';
import { Button, H1Title, H1TitleFontColor, Section } from 'twenty-ui';
import { useGetEnvironmentVariablesGroupedQuery } from '~/generated/graphql';

const StyledGroupContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledGroupVariablesContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
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
  const { data: environmentVariables } = useGetEnvironmentVariablesGroupedQuery(
    {
      fetchPolicy: 'network-only',
    },
  );

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

  return (
    <Section>
      {visibleGroups.map((group) => (
        <StyledGroupContainer key={group.name}>
          <H1Title title={group.name} fontColor={H1TitleFontColor.Primary} />
          {group.description !== '' && (
            <StyledGroupDescription>{group.description}</StyledGroupDescription>
          )}
          {group.variables.length > 0 && (
            <StyledGroupVariablesContainer>
              <SettingsAdminEnvVariablesTable variables={group.variables} />
            </StyledGroupVariablesContainer>
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
                <StyledGroupVariablesContainer>
                  <SettingsAdminEnvVariablesTable
                    variables={selectedGroupData.variables}
                  />
                </StyledGroupVariablesContainer>
              )}
            </StyledGroupContainer>
          )}
        </>
      )}
    </Section>
  );
};
