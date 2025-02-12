import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RECORD_TABLE_TD_WIDTH } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnAggregateFooterValue } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterValue';
import { hasAggregateOperationForViewFieldFamilySelector } from '@/object-record/record-table/record-table-footer/states/hasAggregateOperationForViewFieldFamilySelector';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconChevronDown } from 'twenty-ui';

const StyledCell = styled.div<{ isUnfolded: boolean; isFirstCell: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-weight: ${({ theme }) => theme.font.weight.medium};

  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  min-width: ${({ theme }) => theme.spacing(7)};
  flex-grow: 1;
  max-width: 100%;

  background: ${({ theme, isUnfolded }) =>
    isUnfolded ? theme.background.transparent.light : theme.background.primary};

  &:hover {
    background: ${({ theme, isUnfolded }) =>
      isUnfolded
        ? theme.background.transparent.medium
        : theme.background.transparent.light};
  }

  ${({ isFirstCell }) =>
    isFirstCell &&
    `
    padding-left: ${RECORD_TABLE_TD_WIDTH};
  `}
`;

const StyledIcon = styled(IconChevronDown)`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
  flex-grow: 0;
  flex-shrink: 0;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const RecordTableColumnAggregateFooterValueCell = ({
  dropdownId,
  isFirstCell,
}: {
  dropdownId: string;
  isFirstCell: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDropdownOpen } = useDropdown(dropdownId);
  const theme = useTheme();
  const { viewFieldId, fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterCellContext,
  );

  const hasAggregateOperationForViewField = useRecoilValue(
    hasAggregateOperationForViewFieldFamilySelector({
      viewFieldId,
    }),
  );

  const hasRecordGroups = useRecoilComponentValueV2(
    hasRecordGroupsComponentSelector,
  );

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledCell isUnfolded={isDropdownOpen} isFirstCell={isFirstCell}>
        {isHovered ||
        isDropdownOpen ||
        hasAggregateOperationForViewField ||
        (isFirstCell && !hasRecordGroups) ? (
          <>
            <RecordTableColumnAggregateFooterValue
              fieldMetadataId={fieldMetadataId}
              dropdownId={dropdownId}
            />
            {!hasAggregateOperationForViewField && (
              <StyledIcon fontWeight={'light'} size={theme.icon.size.sm} />
            )}
          </>
        ) : (
          <></>
        )}
      </StyledCell>
    </div>
  );
};
