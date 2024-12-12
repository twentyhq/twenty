import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isScrollEnabledForRecordTableState } from '@/object-record/record-table/states/isScrollEnabledForRecordTableState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';
import { useCallback } from 'react';
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

  return (
    <StyledDropdown
      onOpen={handleDropdownOpen}
      onClose={handleDropdownClose}
      dropdownId={column.fieldMetadataId + '-header'}
      clickableComponent={<RecordTableColumnHead column={column} />}
      dropdownComponents={<RecordTableColumnHeadDropdownMenu column={column} />}
      dropdownOffset={{ x: -1 }}
      dropdownPlacement="bottom-start"
      dropdownHotkeyScope={{ scope: column.fieldMetadataId + '-header' }}
    />
  );
};
