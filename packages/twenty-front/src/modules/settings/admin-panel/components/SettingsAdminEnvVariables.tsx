import { SettingsAdminEnvVariablesRow } from '@/settings/admin-panel/components/SettingsAdminEnvVariablesRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { H1Title, H1TitleFontColor, Section } from 'twenty-ui';
import { useGetEnvironmentVariablesGroupedQuery } from '~/generated/graphql';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledGroupContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledSubGroupContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledGroupVariablesContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledSubGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminEnvVariables = () => {
  const { data: environmentVariables } =
    useGetEnvironmentVariablesGroupedQuery();

  const renderVariablesTable = (
    variables: Array<{
      name: string;
      description: string;
      value: string;
      sensitive: boolean;
    }>,
  ) => (
    <StyledTable>
      <TableRow gridAutoColumns="4fr 3fr 2fr 1fr 1fr">
        <TableHeader>Name</TableHeader>
        <TableHeader>Description</TableHeader>
        <TableHeader>Value</TableHeader>
        <TableHeader align="right"></TableHeader>
        <TableHeader align="right"></TableHeader>
      </TableRow>
      {variables.map((variable) => (
        <SettingsAdminEnvVariablesRow key={variable.name} variable={variable} />
      ))}
    </StyledTable>
  );

  return (
    <Section>
      {environmentVariables?.getEnvironmentVariablesGrouped.groups.map(
        (group) => (
          <StyledGroupContainer key={group.groupName}>
            <H1Title
              title={group.groupName}
              fontColor={H1TitleFontColor.Primary}
            />
            <StyledGroupVariablesContainer>
              {group.variables.length > 0 &&
                renderVariablesTable(group.variables)}
            </StyledGroupVariablesContainer>
            {group.subgroups.map((subgroup) => (
              <StyledSubGroupContainer key={subgroup.subgroupName}>
                <StyledSubGroupTitle>
                  {subgroup.subgroupName}
                </StyledSubGroupTitle>
                {renderVariablesTable(subgroup.variables)}
              </StyledSubGroupContainer>
            ))}
          </StyledGroupContainer>
        ),
      )}
    </Section>
  );
};
