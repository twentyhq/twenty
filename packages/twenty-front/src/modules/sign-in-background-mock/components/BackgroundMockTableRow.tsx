import { styled } from '@linaria/react';
import { useContext } from 'react';

import { type BackgroundMockCompany } from '@/sign-in-background-mock/constants/BackgroundMockCompanies';
import { BACKGROUND_MOCK_COLUMN_WIDTHS } from '@/sign-in-background-mock/constants/BackgroundMockColumnWidths';
import { Avatar, IconLink } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { Chip, ChipAccent, ChipSize, ChipVariant } from 'twenty-ui/components';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';

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
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;
  width: ${({ width }) => width}px;
`;

const StyledTruncated = styled.span`
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
`;

const StyledMutedText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
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
      label={fullName}
      size={ChipSize.Small}
      variant={ChipVariant.Transparent}
      accent={ChipAccent.TextPrimary}
      clickable={false}
      leftComponent={
        <Avatar
          type="rounded"
          placeholder={fullName}
          placeholderColorSeed={fullName}
          size="md"
        />
      }
    />
  );
};

export const BackgroundMockTableRow = ({
  company,
}: BackgroundMockTableRowProps) => {
  const { theme } = useContext(ThemeContext);

  const logoUrl = getLogoUrlFromDomainName(company.domainName);

  return (
    <StyledRow>
      <StyledCheckboxColumn>
        <StyledCheckbox />
      </StyledCheckboxColumn>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS.Name}>
        <Chip
          label={company.name}
          size={ChipSize.Small}
          variant={ChipVariant.Transparent}
          accent={ChipAccent.TextPrimary}
          clickable={false}
          leftComponent={
            <Avatar
              type="squared"
              avatarUrl={logoUrl}
              placeholder={company.name}
              placeholderColorSeed={company.id}
              size="md"
            />
          }
        />
      </StyledCell>
      <StyledCell width={BACKGROUND_MOCK_COLUMN_WIDTHS.Domain}>
        <Chip
          label={company.domainName}
          size={ChipSize.Small}
          variant={ChipVariant.Transparent}
          accent={ChipAccent.TextSecondary}
          clickable={false}
          leftComponent={
            <IconLink
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.tertiary}
            />
          }
        />
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
    </StyledRow>
  );
};
