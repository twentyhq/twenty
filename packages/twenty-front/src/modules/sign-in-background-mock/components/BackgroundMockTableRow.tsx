import { styled } from '@linaria/react';
import { useContext } from 'react';

import { type BackgroundMockCompany } from '@/sign-in-background-mock/constants/BackgroundMockCompanies';
import { BACKGROUND_MOCK_COLUMN_WIDTHS } from '@/sign-in-background-mock/constants/BackgroundMockColumnWidths';
import { BACKGROUND_MOCK_TABLE_DIMENSIONS } from '@/sign-in-background-mock/constants/BackgroundMockTableDimensions';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { Avatar, Chip } from 'twenty-ui/data-display';
import { IconLink } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { Checkbox } from 'twenty-ui/input';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';

const StyledRow = styled.div`
  display: flex;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
`;

const StyledDragHandleColumn = styled.div`
  flex-shrink: 0;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  width: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.dragHandleColumnWidth}px;
`;

const StyledCheckboxColumn = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  justify-content: center;
  padding-right: ${themeCssVariables.spacing[1]};
  width: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.checkboxColumnWidth}px;
`;

const StyledCell = styled.div<{ width: number }>`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-shrink: 0;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  overflow: hidden;
  padding-left: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
  width: ${({ width }) => width}px;
`;

const StyledTruncated = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledMutedText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledLastEmptyCell = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex: 1;
  height: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.rowHeight}px;
  min-width: ${BACKGROUND_MOCK_TABLE_DIMENSIONS.addColumnButtonWidth}px;
`;

type BackgroundMockTableRowProps = {
  company: BackgroundMockCompany;
};

const formatNumber = (value: number) => value.toLocaleString('en-US');

const PersonChip = ({ fullName }: { fullName: string | null }) => {
  if (fullName === null) {
    return null;
  }

  return (
    <Chip
      size="sm"
      variant="ghost"
      color="primary"
      clickable={false}
      startElement={
        <Avatar shape="circle" name={fullName} colorSeed={fullName} size="md" />
      }
      style={{ paddingInlineStart: 0 }}
    >
      {fullName}
    </Chip>
  );
};

export const BackgroundMockTableRow = ({
  company,
}: BackgroundMockTableRowProps) => {
  const { theme } = useContext(ThemeContext);

  const logoUrl = getLogoUrlFromDomainName(company.domainName);

  return (
    <StyledRow>
      <StyledDragHandleColumn />
      <StyledCheckboxColumn>
        <Checkbox hoverable checked={false} />
      </StyledCheckboxColumn>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS.Name}>
        <Chip
          size="sm"
          variant="ghost"
          color="primary"
          clickable={false}
          startElement={
            <Avatar
              shape="square"
              src={getAbsoluteImageUrl(logoUrl)}
              name={company.name}
              colorSeed={company.id}
              size="md"
            />
          }
          style={{ paddingInlineStart: 0 }}
        >
          {company.name}
        </Chip>
      </StyledCell>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS.Domain}>
        <Chip
          size="sm"
          variant="ghost"
          color="secondary"
          weight="medium"
          clickable={false}
          startElement={
            <IconLink
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.tertiary}
            />
          }
          style={{ paddingInlineStart: 0 }}
        >
          {company.domainName}
        </Chip>
      </StyledCell>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS['Created by']}>
        <PersonChip fullName={company.createdBy} />
      </StyledCell>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS['Account Owner']}>
        <PersonChip fullName={company.accountOwner} />
      </StyledCell>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS['Creation date']}>
        <StyledMutedText>{company.creationDate}</StyledMutedText>
      </StyledCell>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS.Employees}>
        <StyledTruncated>{formatNumber(company.employees)}</StyledTruncated>
      </StyledCell>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS.Address}>
        <StyledTruncated>{company.address}</StyledTruncated>
      </StyledCell>
      <StyledLastEmptyCell />
    </StyledRow>
  );
};
