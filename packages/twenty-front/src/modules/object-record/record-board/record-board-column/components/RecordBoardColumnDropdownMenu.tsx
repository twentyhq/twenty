import styled from '@emotion/styled';
import { useCallback, useContext, useRef } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useAddNewOpportunity } from '@/object-record/record-board/record-board-column/hooks/useAddNewOpportunity';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { IconPlus } from 'twenty-ui';

const StyledMenuContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(10)};
  width: 200px;
  z-index: 1;
`;

type RecordBoardColumnDropdownMenuProps = {
  onClose: () => void;
  onDelete?: (id: string) => void;
  stageId: string;
};

export const RecordBoardColumnDropdownMenu = ({
  onClose,
}: RecordBoardColumnDropdownMenuProps) => {
  const boardColumnMenuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    onClose();
  }, [onClose]);

  useListenClickOutside({
    refs: [boardColumnMenuRef],
    callback: closeMenu,
  });

  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const { isCreatingCard, handleNewClick, handleCancel, handleEntitySelect } =
    useAddNewOpportunity();

  return (
    <StyledMenuContainer ref={boardColumnMenuRef}>
      {isCreatingCard ? (
        <SingleEntitySelect
          disableBackgroundBlur
          onCancel={handleCancel}
          onEntitySelected={(company) => {
            handleEntitySelect(company);
            closeMenu();
          }}
          relationObjectNameSingular={CoreObjectNameSingular.Company}
          relationPickerScopeId="relation-picker"
          selectedRelationRecordIds={[]}
        />
      ) : (
        <DropdownMenu data-select-disable>
          <DropdownMenuItemsContainer>
            {columnDefinition.actions.map((action) => (
              <MenuItem
                key={action.id}
                onClick={() => {
                  action.callback();
                  closeMenu();
                }}
                LeftIcon={action.icon}
                text={action.label}
              />
            ))}
            <MenuItem
              onClick={handleNewClick}
              LeftIcon={IconPlus}
              text="Add Record"
            />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      )}
    </StyledMenuContainer>
  );
};
