import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconChevronLeft, IconLayoutKanban, IconTable, IconX } from 'twenty-ui';

import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { ViewsHotkeyScope } from '@/views/types/ViewsHotkeyScope';
import { ViewType } from '@/views/types/ViewType';
import { ViewPickerCreateOrEditButton } from '@/views/view-picker/components/ViewPickerCreateOrEditButton';
import { VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerKanbanFieldDropdownId';
import { VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerViewTypeDropdownId';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useViewPickerPersistView } from '@/views/view-picker/hooks/useViewPickerPersistView';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';

const StyledIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSelectContainer = styled.div`
  display: flex;
  width: calc(100% - ${({ theme }) => theme.spacing(2)});
  margin: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.light};
  user-select: none;
`;

const StyledNoKanbanFieldAvailableContainer = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  margin: ${({ theme }) => theme.spacing(1, 2)};
  user-select: none;
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledSaveButtonContainer = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
  width: calc(100% - ${({ theme }) => theme.spacing(2)});
`;
export const ViewPickerCreateOrEditContent = () => {
  const { viewPickerMode, setViewPickerMode } = useViewPickerMode();
  const {
    viewPickerInputNameState,
    viewPickerSelectedIconState,
    viewPickerIsPersistingState,
    viewPickerKanbanFieldMetadataIdState,
    viewPickerTypeState,
    viewPickerIsDirtyState,
  } = useViewPickerStates();

  const [viewPickerInputName, setViewPickerInputName] = useRecoilState(
    viewPickerInputNameState,
  );
  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] = useRecoilState(
    viewPickerSelectedIconState,
  );
  const viewPickerIsPersisting = useRecoilValue(viewPickerIsPersistingState);
  const setViewPickerIsDirty = useSetRecoilState(viewPickerIsDirtyState);

  const [viewPickerKanbanFieldMetadataId, setViewPickerKanbanFieldMetadataId] =
    useRecoilState(viewPickerKanbanFieldMetadataIdState);

  const [viewPickerType, setViewPickerType] =
    useRecoilState(viewPickerTypeState);

  const setHotkeyScope = useSetHotkeyScope();

  const { handleCreate, handleUpdate } = useViewPickerPersistView();

  useScopedHotkeys(
    Key.Enter,
    async () => {
      if (viewPickerIsPersisting) {
        return;
      }
      if (viewPickerMode === 'create') {
        await handleCreate();
      }
      if (viewPickerMode === 'edit') {
        await handleUpdate();
      }
    },
    ViewsHotkeyScope.ListDropdown,
  );

  const onIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerIsDirty(true);
    setViewPickerSelectedIcon(iconKey);
  };

  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();

  const handleClose = async () => {
    if (viewPickerMode === 'edit') {
      await handleUpdate();
    }
    setViewPickerMode('list');
  };

  return (
    <>
      <DropdownMenuHeader
        StartIcon={viewPickerMode === 'create' ? IconX : IconChevronLeft}
        onClick={handleClose}
      >
        {viewPickerMode === 'create' ? 'Create view' : 'Edit view'}
      </DropdownMenuHeader>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <StyledIconAndNameContainer>
          <IconPicker
            onChange={onIconChange}
            selectedIconKey={viewPickerSelectedIcon}
            disableBlur
            onClose={() => setHotkeyScope(ViewsHotkeyScope.ListDropdown)}
          />
          <DropdownMenuInput
            value={viewPickerInputName}
            onChange={(event) => {
              setViewPickerIsDirty(true);
              setViewPickerInputName(event.target.value);
            }}
            autoFocus
          />
        </StyledIconAndNameContainer>
        {viewPickerMode === 'create' && (
          <StyledSelectContainer>
            <Select
              disableBlur
              label="View type"
              fullWidth
              value={viewPickerType}
              onChange={(value) => {
                setViewPickerIsDirty(true);
                setViewPickerType(value);
              }}
              options={[
                { value: ViewType.Table, label: 'Table', Icon: IconTable },
                {
                  value: ViewType.Kanban,
                  label: 'Kanban',
                  Icon: IconLayoutKanban,
                },
              ]}
              dropdownId={VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID}
            />
          </StyledSelectContainer>
        )}
        {viewPickerType === ViewType.Kanban && viewPickerMode === 'create' && (
          <>
            <StyledSelectContainer>
              <Select
                disableBlur
                label="Stages"
                fullWidth
                value={viewPickerKanbanFieldMetadataId}
                onChange={(value) => setViewPickerKanbanFieldMetadataId(value)}
                options={
                  availableFieldsForKanban.length > 0
                    ? availableFieldsForKanban.map((field) => ({
                        value: field.id,
                        label: field.label,
                      }))
                    : [{ value: '', label: 'No Select field' }]
                }
                dropdownId={VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID}
              />
            </StyledSelectContainer>
            {availableFieldsForKanban.length === 0 && (
              <StyledNoKanbanFieldAvailableContainer>
                Set up a Select field on Companies to create a Kanban
              </StyledNoKanbanFieldAvailableContainer>
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <StyledSaveButtonContainer>
          <ViewPickerCreateOrEditButton />
        </StyledSaveButtonContainer>
      </DropdownMenuItemsContainer>
    </>
  );
};
