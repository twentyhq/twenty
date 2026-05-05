import { styled } from '@linaria/react';
import { useContext } from 'react';

import { BACKGROUND_MOCK_COLUMNS } from '@/sign-in-background-mock/constants/BackgroundMockColumns';
import { BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/BackgroundMockCompanies';
import { BackgroundMockTableRow } from '@/sign-in-background-mock/components/BackgroundMockTableRow';
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
  gap: 4px;
  overflow: hidden;
  padding: 0 8px;
  width: ${({ width }) => width}px;
`;

const StyledHeaderLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  gap: 6px;
  height: 32px;
  padding: 0 16px;
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
        </StyledHeaderRow>
        <StyledTableBody>
          {BACKGROUND_MOCK_COMPANIES.map((company) => (
            <BackgroundMockTableRow key={company.id} company={company} />
          ))}
        </StyledTableBody>
        <StyledFooter>
          <StyledFooterRow>
            <IconPlus size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
            Add New
          </StyledFooterRow>
          <StyledFooterRow>
            Calculate
            <IconChevronDown
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.sm}
            />
          </StyledFooterRow>
        </StyledFooter>
      </StyledTable>
    </StyledTableWrapper>
  );
};
