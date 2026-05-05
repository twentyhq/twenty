import { styled } from '@linaria/react';
import { useContext } from 'react';

import { type BackgroundMockCompany } from '@/sign-in-background-mock/constants/BackgroundMockCompanies';
import { BACKGROUND_MOCK_COLUMNS } from '@/sign-in-background-mock/constants/BackgroundMockColumns';
import { Avatar, IconBrandLinkedin, IconLink } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const ROW_HEIGHT = 32;

const StyledRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  height: ${ROW_HEIGHT}px;
`;

const StyledCheckboxColumn = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding-left: 8px;
  width: 36px;
`;

const StyledCheckbox = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.xs};
  height: 12px;
  width: 12px;
`;

const StyledCell = styled.div<{ width: number }>`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  overflow: hidden;
  padding: 0 8px;
  white-space: nowrap;
  width: ${({ width }) => width}px;
`;

const StyledNameChip = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  overflow: hidden;
`;

const StyledLinkText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  overflow: hidden;
  text-decoration: underline;
  text-decoration-color: ${themeCssVariables.font.color.tertiary};
  text-overflow: ellipsis;
`;

const StyledMutedText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTruncated = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledPersonChip = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: 4px;
  overflow: hidden;
  padding: 1px 6px 1px 2px;
`;

const StyledPersonName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledOpportunityChip = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 4px;
  padding: 1px 6px;
`;

type BackgroundMockTableRowProps = {
  company: BackgroundMockCompany;
};

const findColumn = (label: string) => {
  const column = BACKGROUND_MOCK_COLUMNS.find((c) => c.label === label);
  if (column === undefined) {
    throw new Error(`Background mock column "${label}" is not configured`);
  }
  return column;
};

const formatNumber = (value: number) =>
  value.toLocaleString('en-US').replace(/,/g, ',');

export const BackgroundMockTableRow = ({
  company,
}: BackgroundMockTableRowProps) => {
  const { theme } = useContext(ThemeContext);

  const nameColumn = findColumn('Name');
  const domainColumn = findColumn('Domain');
  const employeesColumn = findColumn('Employees');
  const peopleColumn = findColumn('People');
  const addressColumn = findColumn('Address');
  const accountOwnerColumn = findColumn('Account Owner');
  const creationDateColumn = findColumn('Creation date');
  const idealCustomerProfileColumn = findColumn('ICP');
  const linkedinColumn = findColumn('Linkedin');
  const opportunitiesColumn = findColumn('Opportunities');
  const xColumn = findColumn('X');

  return (
    <StyledRow>
      <StyledCheckboxColumn>
        <StyledCheckbox />
      </StyledCheckboxColumn>
      <StyledCell width={nameColumn.width}>
        <StyledNameChip>
          <Avatar
            type="squared"
            placeholder={company.name}
            placeholderColorSeed={company.id}
            size="sm"
          />
          <StyledTruncated>{company.name}</StyledTruncated>
        </StyledNameChip>
      </StyledCell>
      <StyledCell width={domainColumn.width}>
        <IconLink size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        <StyledLinkText>{company.domainName}</StyledLinkText>
      </StyledCell>
      <StyledCell width={employeesColumn.width}>
        <StyledTruncated>{formatNumber(company.employees)}</StyledTruncated>
      </StyledCell>
      <StyledCell width={peopleColumn.width}>
        {company.people.slice(0, 1).map((person, index) => (
          <StyledPersonChip key={`${company.id}-person-${index}`}>
            <Avatar
              type="rounded"
              placeholder={`${person.firstName} ${person.lastName}`}
              placeholderColorSeed={`${company.id}-person-${index}`}
              size="sm"
            />
            <StyledPersonName>
              {person.firstName} {person.lastName}
            </StyledPersonName>
          </StyledPersonChip>
        ))}
      </StyledCell>
      <StyledCell width={addressColumn.width}>
        <StyledTruncated>{company.address}</StyledTruncated>
      </StyledCell>
      <StyledCell width={accountOwnerColumn.width} />
      <StyledCell width={creationDateColumn.width}>
        <StyledMutedText>{company.creationDate}</StyledMutedText>
      </StyledCell>
      <StyledCell width={idealCustomerProfileColumn.width} />
      <StyledCell width={linkedinColumn.width}>
        {company.linkedinHandle !== null && (
          <>
            <IconBrandLinkedin
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.sm}
            />
            <StyledLinkText>{company.linkedinHandle}</StyledLinkText>
          </>
        )}
      </StyledCell>
      <StyledCell width={opportunitiesColumn.width}>
        {company.opportunitiesCount > 0 && (
          <StyledOpportunityChip>Untitled</StyledOpportunityChip>
        )}
      </StyledCell>
      <StyledCell width={xColumn.width} />
    </StyledRow>
  );
};
