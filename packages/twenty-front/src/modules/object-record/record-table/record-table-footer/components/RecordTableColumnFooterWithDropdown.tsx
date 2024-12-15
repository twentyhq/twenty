import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableColumnFooterAggregateValue } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnFooterAggregateValue';
import { RecordTableColumnFooterDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnFooterDropdown';
import { useAggregateRecordsForRecordTableColumnFooter } from '@/object-record/record-table/record-table-footer/hooks/useAggregateRecordsForRecordTableColumnFooter';
import { isScrollEnabledForRecordTableState } from '@/object-record/record-table/states/isScrollEnabledForRecordTableState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';
import { useCallback } from 'react';

type RecordTableColumnFooterWithDropdownProps = {
  column: ColumnDefinition<FieldMetadata>;
};

const StyledDropdown = styled(Dropdown)`
  display: flex;
  flex: 1;
  z-index: ${({ theme }) => theme.lastLayerZIndex};

  transition: opacity 150ms ease-in-out;
`;

export const RecordTableColumnFooterWithDropdown = ({
  column,
}: RecordTableColumnFooterWithDropdownProps) => {
  const setIsScrollEnabledForRecordTable = useSetRecoilComponentStateV2(
    isScrollEnabledForRecordTableState,
  );

  const handleDropdownOpen = useCallback(() => {
    setIsScrollEnabledForRecordTable({
      enableXScroll: false,
      enableYScroll: false,
    });
  }, [setIsScrollEnabledForRecordTable]);

  const handleDropdownClose = useCallback(() => {
    setIsScrollEnabledForRecordTable({
      enableXScroll: true,
      enableYScroll: true,
    });
  }, [setIsScrollEnabledForRecordTable]);

  const { aggregateValue, aggregateLabel } =
    useAggregateRecordsForRecordTableColumnFooter(column.fieldMetadataId);

  const dropdownId = column.fieldMetadataId + '-footer';

  return (
    <StyledDropdown
      onOpen={handleDropdownOpen}
      onClose={handleDropdownClose}
      dropdownId={dropdownId}
      clickableComponent={
        <RecordTableColumnFooterAggregateValue
          aggregateLabel={aggregateLabel}
          aggregateValue={aggregateValue}
          dropdownId={dropdownId}
        />
      }
      dropdownComponents={<RecordTableColumnFooterDropdown column={column} />}
      dropdownOffset={{ x: -1 }}
      dropdownPlacement="bottom-start"
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
