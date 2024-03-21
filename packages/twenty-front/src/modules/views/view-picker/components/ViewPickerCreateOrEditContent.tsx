import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { IconChevronLeft, IconX } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
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
  } = useViewPickerStates();

  const [viewPickerInputName, setViewPickerInputName] = useRecoilState(
    viewPickerInputNameState,
  );
  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] = useRecoilState(
    viewPickerSelectedIconState,
  );
  const viewPickerIsPersisting = useRecoilValue(viewPickerIsPersistingState);

  const [viewPickerKanbanFieldMetadataId, setViewPickerKanbanFieldMetadataId] =
    useRecoilState(viewPickerKanbanFieldMetadataIdState);

  const [viewPickerType, setViewPickerType] =
    useRecoilState(viewPickerTypeState);

  const setHotkeyScope = useSetHotkeyScope();

  const { handleCreate, handleDelete, handleUpdate } =
    useViewPickerPersistView();

  useScopedHotkeys(
    Key.Enter,
    async () => {
      if (viewPickerMode === 'create') {
        if (viewPickerIsPersisting) {
          return;
        }
        await handleCreate();
      }
      if (viewPickerMode === 'edit') {
        if (viewPickerIsPersisting) {
          return;
        }
        await handleUpdate();
      }
    },
    ViewsHotkeyScope.ListDropdown,
  );

  const onIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerSelectedIcon(iconKey);
  };

  const { availableFieldsForKanban, navigateToSelectSettings } =
    useGetAvailableFieldsForKanban();

  return (
    <>
      <DropdownMenuHeader
        StartIcon={viewPickerMode === 'create' ? IconX : IconChevronLeft}
        onClick={() => setViewPickerMode('list')}
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
            onChange={(event) => setViewPickerInputName(event.target.value)}
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
              onChange={(value) => setViewPickerType(value)}
              options={[
                { value: ViewType.Table, label: 'Table' },
                { value: ViewType.Kanban, label: 'Kanban' },
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
                value={viewPickerType}
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
            <StyledSelectContainer>
              Set up a Select field on Companies to create a Kanban
            </StyledSelectContainer>
          </>
        )}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <StyledSaveButtonContainer>
          {viewPickerMode === 'create' &&
            (viewPickerType === ViewType.Table ||
              availableFieldsForKanban.length > 0) && (
              <Button
                title="Create"
                onClick={handleCreate}
                accent="blue"
                fullWidth
                justify="center"
                disabled={
                  viewPickerIsPersisting ||
                  (viewPickerType === ViewType.Kanban &&
                    viewPickerKanbanFieldMetadataId === '')
                }
              />
            )}
          {viewPickerMode === 'create' &&
            viewPickerType === ViewType.Kanban &&
            availableFieldsForKanban.length === 0 && (
              <Button
                title="Go to Settings"
                onClick={navigateToSelectSettings}
                accent="blue"
                fullWidth
                justify="center"
              />
            )}
          {viewPickerMode === 'edit' && (
            <Button
              title="Delete"
              onClick={handleDelete}
              accent="danger"
              fullWidth
              justify="center"
              focus={false}
              variant="secondary"
              disabled={viewPickerIsPersisting}
            />
          )}
        </StyledSaveButtonContainer>
      </DropdownMenuItemsContainer>
    </>
  );
};
