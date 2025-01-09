import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnAggregateFooterValue } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterValue';
import { hasAggregateOperationForViewFieldFamilySelector } from '@/object-record/record-table/record-table-footer/states/hasAggregateOperationForViewFieldFamilySelector';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconChevronDown } from 'twenty-ui';

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-weight: ${({ theme }) => theme.font.weight.medium};

  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(7)};
  justify-content: space-between;
  min-width: ${({ theme }) => theme.spacing(7)};
  flex-grow: 1;
  width: 100%;
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

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledCell>
        {isHovered ||
        isDropdownOpen ||
        hasAggregateOperationForViewField ||
        isFirstCell ? (
          <>
            <RecordTableColumnAggregateFooterValue
              fieldMetadataId={fieldMetadataId}
              dropdownId={dropdownId}
            />
            <StyledIcon fontWeight={'light'} size={theme.icon.size.sm} />
          </>
        ) : (
          <></>
        )}
      </StyledCell>
    </div>
  );
};
