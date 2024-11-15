import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isScrollEnabledForRecordTableState } from '@/object-record/record-table/states/isScrollEnabledForRecordTableState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { RecordTableColumnHead } from './RecordTableColumnHead';
import { RecordTableColumnHeadDropdownMenu } from './RecordTableColumnHeadDropdownMenu';

type RecordTableColumnHeadWithDropdownProps = {
  column: ColumnDefinition<FieldMetadata>;
};

const StyledDropdown = styled(Dropdown)`
  display: flex;
  flex: 1;
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

export const RecordTableColumnHeadWithDropdown = ({
  column,
}: RecordTableColumnHeadWithDropdownProps) => {
  const isScrollEnabledForRecordTable = useSetRecoilState(
    isScrollEnabledForRecordTableState,
  );

  const handleDropdownOpen = useCallback(() => {
    isScrollEnabledForRecordTable({
      enableXScroll: false,
      enableYScroll: false,
    });
  }, [isScrollEnabledForRecordTable]);

  const handleDropdownClose = useCallback(() => {
    isScrollEnabledForRecordTable({
      enableXScroll: true,
      enableYScroll: true,
    });
  }, [isScrollEnabledForRecordTable]);

  return (
    <StyledDropdown
      onOpen={handleDropdownOpen}
      onClose={handleDropdownClose}
      dropdownId={column.fieldMetadataId + '-header'}
      clickableComponent={<RecordTableColumnHead column={column} />}
      dropdownComponents={<RecordTableColumnHeadDropdownMenu column={column} />}
      dropdownOffset={{ x: -1 }}
      usePortal
      dropdownPlacement="bottom-start"
      dropdownHotkeyScope={{ scope: column.fieldMetadataId + '-header' }}
    />
  );
};
