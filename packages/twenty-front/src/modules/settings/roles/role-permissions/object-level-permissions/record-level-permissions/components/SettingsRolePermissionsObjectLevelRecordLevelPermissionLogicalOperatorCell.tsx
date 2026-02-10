/* @license Enterprise */

import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { capitalize } from 'twenty-shared/utils';

import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS } from '@/object-record/advanced-filter/constants/AdvancedFilterLogicalOperatorOptions';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

const StyledText = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  min-width: ${({ theme }) => theme.spacing(16)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCellProps =
  {
    index: number;
    recordFilterGroup: RecordFilterGroup;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCell =
  ({
    index,
    recordFilterGroup,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionLogicalOperatorCellProps) => {
    const { readonly } = useContext(AdvancedFilterContext);

    return (
      <StyledContainer>
        {index === 0 ? (
          <StyledText>{t`Where`}</StyledText>
        ) : index === 1 ? (
          readonly ? (
            <Select
              dropdownWidth={GenericDropdownContentWidth.Narrow}
              dropdownId={`advanced-filter-logical-operator-${recordFilterGroup.id}`}
              value={recordFilterGroup.logicalOperator}
              options={ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS}
              dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
              disabled
            />
          ) : (
            <AdvancedFilterLogicalOperatorDropdown
              recordFilterGroup={recordFilterGroup}
            />
          )
        ) : (
          <StyledText>
            {capitalize(recordFilterGroup.logicalOperator.toLowerCase())}
          </StyledText>
        )}
      </StyledContainer>
    );
  };
