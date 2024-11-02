import styled from '@emotion/styled';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { RecordTableColumnHeadDropdownMenu } from './RecordTableColumnHeadDropdownMenu';

import { RecordTableScrollContext } from '@/object-record/record-table/contexts/RecordTableScrollContext';
import { useCallback, useContext } from 'react';
import { RecordTableColumnHead } from './RecordTableColumnHead';

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
  const { setEnableXScroll, setEnableYScroll } = useContext(
    RecordTableScrollContext,
  );
  const handleDropdownOpen = useCallback(() => {
    setEnableXScroll(false);
    setEnableYScroll(false);
  }, [setEnableXScroll, setEnableYScroll]);
  const handleDropdownClose = useCallback(() => {
    setEnableXScroll(true);
    setEnableYScroll(true);
  }, [setEnableXScroll, setEnableYScroll]);
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
