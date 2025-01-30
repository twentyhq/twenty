import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { H1Title, H1TitleFontColor, Section } from 'twenty-ui';
import { useGetEnvironmentVariablesQuery } from '~/generated/graphql';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledGroupContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledSubGroupContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledSubGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminEnvVariables = () => {
  const { data: environmentVariables } = useGetEnvironmentVariablesQuery();

  const renderVariablesTable = (
    variables: Array<{ name: string; description: string; value: string }>,
  ) => (
    <StyledTable>
      <TableRow
        gridAutoColumns="minmax(250px, 2fr) minmax(200px, 2fr) minmax(300px, 3fr)"
        mobileGridAutoColumns="150px 1fr 1fr"
      >
        <TableHeader>Name</TableHeader>
        <TableHeader>Description</TableHeader>
        <TableHeader>Value</TableHeader>
      </TableRow>
      {variables.map((variable) => (
        <TableRow
          key={variable.name}
          gridAutoColumns="minmax(250px, 2fr) minmax(200px, 2fr) minmax(300px, 3fr)"
          mobileGridAutoColumns="150px 1fr 1fr"
        >
          <TableCell>{variable.name}</TableCell>
          <TableCell>{variable.description}</TableCell>
          <TableCell>{variable.value}</TableCell>
        </TableRow>
      ))}
    </StyledTable>
  );

  return (
    <Section>
      {environmentVariables?.getEnvironmentVariables.groups.map((group) => (
        <StyledGroupContainer key={group.groupName}>
          <H1Title
            title={group.groupName}
            fontColor={H1TitleFontColor.Primary}
          />

          {group.standalone.length > 0 &&
            renderVariablesTable(group.standalone)}

          {group.subgroups.map((subgroup) => (
            <StyledSubGroupContainer key={subgroup.subgroupName}>
              <StyledSubGroupTitle>{subgroup.subgroupName}</StyledSubGroupTitle>
              {renderVariablesTable(subgroup.variables)}
            </StyledSubGroupContainer>
          ))}
        </StyledGroupContainer>
      ))}
    </Section>
  );
};
