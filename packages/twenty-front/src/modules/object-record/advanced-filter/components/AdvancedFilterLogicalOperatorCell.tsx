import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { capitalize } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledText = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[8]};

  padding-left: 9px;
`;

const StyledContainer = styled.div`
  align-items: start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  min-width: ${themeCssVariables.spacing[20]};
`;

type AdvancedFilterLogicalOperatorCellProps = {
  index: number;
  recordFilterGroup: RecordFilterGroup;
};

export const AdvancedFilterLogicalOperatorCell = ({
  index,
  recordFilterGroup,
}: AdvancedFilterLogicalOperatorCellProps) => {
  return (
    <StyledContainer>
      {index === 0 ? (
        <StyledText>{t`Where`}</StyledText>
      ) : index === 1 ? (
        <AdvancedFilterLogicalOperatorDropdown
          recordFilterGroup={recordFilterGroup}
        />
      ) : (
        <StyledText>
          {capitalize(recordFilterGroup.logicalOperator.toLowerCase())}
        </StyledText>
      )}
    </StyledContainer>
  );
};
