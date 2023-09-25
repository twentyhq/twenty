import styled from '@emotion/styled';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import {
  EntityTableHeaderOptionsProps,
  TableColumnDropdownMenu,
} from '@/ui/table/components/TableColumnDropdownMenu';

const StyledDropdownContainer = styled.div`
  left: 0px;
  position: absolute;
  top: 32px;
  z-index: 1;
`;

export const EntityTableHeaderOptions = ({
  isFirstColumn,
  isLastColumn,
  primaryColumnKey,
  column,
}: EntityTableHeaderOptionsProps) => {
  return (
    <StyledDropdownContainer>
      <DropdownButton
        dropdownId={column.key + '-header'}
        dropdownComponents={
          <TableColumnDropdownMenu
            column={column}
            isFirstColumn={isFirstColumn}
            isLastColumn={isLastColumn}
            primaryColumnKey={primaryColumnKey}
          />
        }
        dropdownHotkeyScope={{ scope: column.key + '-header' }}
      />
    </StyledDropdownContainer>
  );
};
