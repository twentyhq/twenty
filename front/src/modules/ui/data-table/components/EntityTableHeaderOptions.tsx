import styled from '@emotion/styled';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';

import {
  EntityTableHeaderOptionsProps,
  TableColumnDropdownMenu,
} from './TableColumnDropdownMenu';

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
      <DropdownMenu
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
