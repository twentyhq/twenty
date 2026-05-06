import { styled } from '@linaria/react';
import { useContext } from 'react';

import { BackgroundMockTableRow } from '@/sign-in-background-mock/components/BackgroundMockTableRow';
import { BACKGROUND_MOCK_COLUMNS } from '@/sign-in-background-mock/constants/BackgroundMockColumns';
import { BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/BackgroundMockCompanies';
import { BACKGROUND_MOCK_TABLE_DIMENSIONS } from '@/sign-in-background-mock/constants/BackgroundMockTableDimensions';
import { IconChevronDown, IconPlus, useIcons } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledTable = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  overflow: hidden;
  position: relative;
`;

const StyledHeaderRow = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
`;

const StyledCheckboxHeaderColumn = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  justify-content: center;
  padding-right: ${themeCssVariables.spacing[1]};
  width: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.checkboxColumnWidth}px;
`;

const StyledHeaderCell = styled.div<{ width: number }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: ${({ width }) => width}px;
`;

const StyledHeaderLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAddColumnHeaderCell = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  justify-content: center;
  width: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.addColumnButtonWidth}px;
`;

const StyledTableBody = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const StyledFooterRow = styled.div`
  display: flex;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
`;

const StyledFooterCheckboxColumn = styled.div`
  flex-shrink: 0;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  width: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.checkboxColumnWidth}px;
`;

const StyledFooterCell = styled.div<{ width: number }>`
  align-items: center;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  justify-content: space-between;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: ${({ width }) => width}px;
`;

const StyledFooterValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

export const BackgroundMockTable = () => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  return (
    <StyledTableWrapper>
      <StyledTable>
        <StyledHeaderRow>
          <StyledCheckboxHeaderColumn>
            <Checkbox hoverable checked={false} />
          </StyledCheckboxHeaderColumn>
          {BACKGROUND_MOCK_COLUMNS.map((column) => {
            const Icon = getIcon(column.iconName);
            return (
              <StyledHeaderCell key={column.label} width={column.width}>
                {Icon !== undefined && (
                  <Icon
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                )}
                <StyledHeaderLabel>{column.label}</StyledHeaderLabel>
              </StyledHeaderCell>
            );
          })}
          <StyledAddColumnHeaderCell>
            <IconPlus size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
          </StyledAddColumnHeaderCell>
        </StyledHeaderRow>
        <StyledTableBody>
          {BACKGROUND_MOCK_COMPANIES.map((company) => (
            <BackgroundMockTableRow key={company.id} company={company} />
          ))}
        </StyledTableBody>
        <StyledFooterRow>
          <StyledFooterCheckboxColumn />
          <StyledFooterCell width={BACKGROUND_MOCK_COLUMNS[0].width}>
            <span>Calculate</span>
            <IconChevronDown
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.sm}
            />
          </StyledFooterCell>
          <StyledFooterCell width={BACKGROUND_MOCK_COLUMNS[1].width}>
            <span>Count all</span>
            <StyledFooterValue>599</StyledFooterValue>
          </StyledFooterCell>
          <StyledFooterCell width={BACKGROUND_MOCK_COLUMNS[2].width} />
          <StyledFooterCell width={BACKGROUND_MOCK_COLUMNS[3].width} />
          <StyledFooterCell width={BACKGROUND_MOCK_COLUMNS[4].width} />
          <StyledFooterCell width={BACKGROUND_MOCK_COLUMNS[5].width}>
            <span>Max of Em…</span>
            <StyledFooterValue>284,571</StyledFooterValue>
          </StyledFooterCell>
          <StyledFooterCell width={BACKGROUND_MOCK_COLUMNS[6].width}>
            <span>Not empty of Add…</span>
            <StyledFooterValue>599</StyledFooterValue>
          </StyledFooterCell>
        </StyledFooterRow>
      </StyledTable>
    </StyledTableWrapper>
  );
};
