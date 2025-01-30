import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  Banner,
  H1Title,
  H1TitleFontColor,
  IconChevronRight,
  Section,
  Toggle,
} from 'twenty-ui';
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

const StyledTruncatedCell = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const StyledExpandedDetails = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin: ${({ theme }) => theme.spacing(2)} 0;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledDetailRow = styled.div`
  margin: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledDetailLabel = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledTransitionedIconChevronRight = styled(IconChevronRight)<{
  isExpanded: boolean;
}>`
  cursor: pointer;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: ${({ theme }) =>
    `transform ${theme.animation.duration.normal}s ease`};
`;

const StyledBannerContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledBanner = styled(Banner)`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledBannerText = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

interface VariableRowProps {
  variable: {
    name: string;
    description: string;
    value: string;
  };
}

const VariableRow = ({ variable }: VariableRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();

  return (
    <>
      <TableRow
        onClick={() => setIsExpanded(!isExpanded)}
        gridAutoColumns="4fr 3fr 2fr 1fr"
      >
        <StyledTruncatedCell color="primary">
          {variable.name}
        </StyledTruncatedCell>
        <StyledTruncatedCell>{variable.description}</StyledTruncatedCell>
        <StyledTruncatedCell align="right">
          {variable.value}
        </StyledTruncatedCell>
        <TableCell align="right">
          <StyledTransitionedIconChevronRight
            isExpanded={isExpanded}
            size={theme.icon.size.sm}
          />
        </TableCell>
      </TableRow>
      {isExpanded && (
        <StyledExpandedDetails>
          <StyledDetailRow>
            <StyledDetailLabel>Name:</StyledDetailLabel>
            {variable.name}
          </StyledDetailRow>
          <StyledDetailRow>
            <StyledDetailLabel>Description:</StyledDetailLabel>
            {variable.description}
          </StyledDetailRow>
          <StyledDetailRow>
            <StyledDetailLabel>Value:</StyledDetailLabel>
            {variable.value}
          </StyledDetailRow>
        </StyledExpandedDetails>
      )}
    </>
  );
};

export const SettingsAdminEnvVariables = () => {
  const theme = useTheme();
  const [showSensitive, setShowSensitive] = useState(false);
  const { data: environmentVariables } = useGetEnvironmentVariablesQuery({
    variables: {
      includeSensitive: showSensitive,
    },
  });

  const renderVariablesTable = (
    variables: Array<{ name: string; description: string; value: string }>,
  ) => (
    <StyledTable>
      <TableRow gridAutoColumns="4fr 3fr 2fr 1fr">
        <TableHeader>Name</TableHeader>
        <TableHeader>Description</TableHeader>
        <TableHeader align="right">Value</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      {variables.map((variable) => (
        <VariableRow key={variable.name} variable={variable} />
      ))}
    </StyledTable>
  );

  return (
    <Section>
      <StyledBanner variant="danger">
        <StyledBannerContainer>
          <StyledBannerText>Show sensitive variables</StyledBannerText>
          <Toggle
            onChange={() => setShowSensitive(!showSensitive)}
            value={showSensitive}
            color={theme.color.red50}
          />
        </StyledBannerContainer>
      </StyledBanner>
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
