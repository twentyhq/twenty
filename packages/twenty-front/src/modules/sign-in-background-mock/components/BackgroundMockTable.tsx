import { styled } from '@linaria/react';
import { useContext } from 'react';

import { BackgroundMockTableRow } from '@/sign-in-background-mock/components/BackgroundMockTableRow';
import { BACKGROUND_MOCK_COLUMNS } from '@/sign-in-background-mock/constants/BackgroundMockColumns';
import { BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/BackgroundMockCompanies';
import { IconChevronDown, IconPlus, useIcons } from 'twenty-ui/display';
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
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  height: 32px;
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

const StyledHeaderCell = styled.div<{ width: number }>`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
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
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: 32px;
`;

const StyledTableBody = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const StyledFooter = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledFooterRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: 32px;
`;

const StyledFooterCheckboxColumn = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
  height: 100%;
  width: 36px;
`;

const StyledFooterCell = styled.div<{ width: number }>`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: ${({ width }) => width}px;
`;

const StyledFooterLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledFooterValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-left: auto;
`;

export const BackgroundMockTable = () => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  return (
    <StyledTableWrapper>
      <StyledTable>
        <StyledHeaderRow>
          <StyledCheckboxColumn>
            <StyledCheckbox />
          </StyledCheckboxColumn>
          {BACKGROUND_MOCK_COLUMNS.map((column) => {
            const Icon = getIcon(column.iconName);
            return (
              <StyledHeaderCell key={column.label} width={column.width}>
                {Icon !== undefined && (
                  <Icon
                    size={theme.icon.size.sm}
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
        <StyledFooter>
          <StyledFooterRow>
            <StyledFooterCheckboxColumn />
            <StyledFooterCell width={180}>
              <StyledFooterLabel>Calculate</StyledFooterLabel>
              <IconChevronDown
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.sm}
              />
            </StyledFooterCell>
            <StyledFooterCell width={130}>
              <StyledFooterLabel>Count all</StyledFooterLabel>
              <StyledFooterValue>599</StyledFooterValue>
            </StyledFooterCell>
            <StyledFooterCell width={130} />
            <StyledFooterCell width={130} />
            <StyledFooterCell width={130} />
            <StyledFooterCell width={110}>
              <StyledFooterLabel>Max of Em…</StyledFooterLabel>
              <StyledFooterValue>284,571</StyledFooterValue>
            </StyledFooterCell>
            <StyledFooterCell width={200}>
              <StyledFooterLabel>Not empty of Add…</StyledFooterLabel>
              <StyledFooterValue>599</StyledFooterValue>
            </StyledFooterCell>
          </StyledFooterRow>
        </StyledFooter>
      </StyledTable>
    </StyledTableWrapper>
  );
};
