import { useJsonFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useJsonFieldDisplay';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import styled from '@emotion/styled';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FloatingIconButton,
  IconPencil,
  isTwoFirstDepths,
  JsonTree,
} from 'twenty-ui';

const StyledJsonTreeContainer = styled.div`
  box-sizing: border-box;
  height: 300px;
  padding: ${({ theme }) => theme.spacing(2)};
  overflow: auto;
  position: relative;
`;

const StyledSwitchModeButtonContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
`;

export const JsonFieldDisplay = () => {
  const id = useId();

  const { fieldValue, maxWidth } = useJsonFieldDisplay();

  const { openTableCell } = useOpenRecordTableCellFromCell();

  if (!isDefined(fieldValue)) {
    return <></>;
  }

  const value = JSON.stringify(fieldValue);

  const handleStartEditing = () => {
    openTableCell();
  };

  return (
    <Dropdown
      clickableComponent={
        <div
          style={{
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {value}
        </div>
      }
      dropdownMenuWidth={400}
      dropdownPlacement="top-start"
      dropdownOffset={{ x: -12, y: -33 }}
      dropdownComponents={
        <StyledJsonTreeContainer
          className="expanded-cell"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <StyledSwitchModeButtonContainer>
            <FloatingIconButton
              Icon={IconPencil}
              onClick={handleStartEditing}
            />
          </StyledSwitchModeButtonContainer>

          <JsonTree
            value={fieldValue}
            arrowButtonCollapsedLabel=""
            arrowButtonExpandedLabel=""
            emptyArrayLabel=""
            emptyObjectLabel=""
            emptyStringLabel=""
            shouldExpandNodeInitially={isTwoFirstDepths}
          />
        </StyledJsonTreeContainer>
      }
      dropdownHotkeyScope={{
        scope: TableHotkeyScope.TableSoftFocus,
      }}
      dropdownId={id}
      onClickOutside={() => {
        console.log('on clicked outside');
      }}
    />
  );
};
