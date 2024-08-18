import styled from '@emotion/styled';
import { useCallback, useContext, useRef } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
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
  const { objectMetadataItem } = useContext(RecordBoardContext);
  const closeMenu = useCallback(() => {
    onClose();
  }, [onClose]);

  useListenClickOutside({
    refs: [boardColumnMenuRef],
    callback: closeMenu,
  });

  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const {
    isCreatingCard,
    handleAddNewOpportunityClick,
    handleCancel,
    handleEntitySelect,
  } = useAddNewOpportunity();
  const { handleAddNewCardClick } = useAddNewCard();

  const isOpportunity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity;

  const handleClick = isOpportunity
    ? handleAddNewOpportunityClick
    : () => {
        handleAddNewCardClick();
        closeMenu();
      };

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
              onClick={handleClick}
              LeftIcon={IconPlus}
              text="Add Record"
            />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      )}
    </StyledMenuContainer>
  );
};
