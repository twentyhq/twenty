import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTitleWithSelectedRecords = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  padding-right: ${themeCssVariables.spacing['0.5']};
`;

const StyledSelectedRecordsCount = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding-left: ${themeCssVariables.spacing['0.5']};
`;

type RecordIndexPageHeaderTitleProps = {
  label: string;
  numberOfSelectedRecords: number;
};

export const RecordIndexPageHeaderTitle = ({
  label,
  numberOfSelectedRecords,
}: RecordIndexPageHeaderTitleProps) => {
  const { formatNumber } = useNumberFormat();

  if (numberOfSelectedRecords === 0) {
    return <>{label}</>;
  }

  return (
    <StyledTitleWithSelectedRecords>
      <StyledTitle>{label}</StyledTitle>
      <>{'->'}</>
      <StyledSelectedRecordsCount>
        {t`${formatNumber(numberOfSelectedRecords)} selected`}
      </StyledSelectedRecordsCount>
    </StyledTitleWithSelectedRecords>
  );
};
