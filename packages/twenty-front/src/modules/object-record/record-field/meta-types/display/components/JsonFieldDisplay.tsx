import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useJsonFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useJsonFieldDisplay';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
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

  const { isFocused } = useFieldFocus();
  const { fieldValue, maxWidth } = useJsonFieldDisplay();

  const {
    displayModeContent,
    customEditHotkeyScope,
    editModeContent,
    editModeContentOnly,
    readonly,
    loading,
    isCentered,
  } = useRecordInlineCellContext();

  // const { openTableCell } = useOpenRecordTableCellFromCell();
  const { openInlineCell } = useInlineCell();

  const isDisplayModeContentEmpty = useIsFieldEmpty();

  if (!isDefined(fieldValue)) {
    return <></>;
  }

  const value = JSON.stringify(fieldValue);

  // Taken from packages/twenty-front/src/modules/object-record/record-inline-cell/components/RecordInlineCellDisplayMode.tsx
  const showEditButton =
    isFocused && !isDisplayModeContentEmpty && !editModeContentOnly;

  const handleStartEditing = () => {
    openInlineCell();
    // openTableCell();
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
          {showEditButton && (
            <StyledSwitchModeButtonContainer>
              <FloatingIconButton
                Icon={IconPencil}
                onClick={handleStartEditing}
              />
            </StyledSwitchModeButtonContainer>
          )}

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
