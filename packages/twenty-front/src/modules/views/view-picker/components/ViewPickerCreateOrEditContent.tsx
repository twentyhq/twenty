import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { IconChevronLeft, IconX } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useHandleViews } from '@/views/hooks/useHandleViews';
import { ViewsHotkeyScope } from '@/views/types/ViewsHotkeyScope';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';

const StyledIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(1)};
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
    viewPickerReferenceViewIdState,
  } = useViewPickerStates();

  const [viewPickerInputName, setViewPickerInputName] = useRecoilState(
    viewPickerInputNameState,
  );
  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] = useRecoilState(
    viewPickerSelectedIconState,
  );
  const [viewPickerIsPersisting, setViewPickerIsPersisting] = useRecoilState(
    viewPickerIsPersistingState,
  );

  const viewPickerReferenceViewId = useRecoilValue(
    viewPickerReferenceViewIdState,
  );

  const { createEmptyView, selectView, removeView, updateView } =
    useHandleViews();

  const { viewsOnCurrentObject } = useGetCurrentView();

  const { closeDropdown } = useDropdown(VIEW_PICKER_DROPDOWN_ID);

  const setHotkeyScope = useSetHotkeyScope();

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
        setViewPickerIsPersisting(true);
        await updateView({
          id: viewPickerReferenceViewId,
          name: viewPickerInputName,
          icon: viewPickerSelectedIcon,
        });
        selectView(viewPickerReferenceViewId);
        setViewPickerIsPersisting(false);
        setViewPickerMode('list');
        closeDropdown();
      }
    },
    ViewsHotkeyScope.ListDropdown,
  );

  const onIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerSelectedIcon(iconKey);
  };

  const handleCreate = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const name = getSnapshotValue(snapshot, viewPickerInputNameState);
        const iconKey = getSnapshotValue(snapshot, viewPickerSelectedIconState);
        const id = v4();
        setViewPickerIsPersisting(true);
        await createEmptyView({ id, name, icon: iconKey });
        setViewPickerIsPersisting(false);
        setViewPickerMode('list');
        selectView(id);
        closeDropdown();
      },
    [
      closeDropdown,
      createEmptyView,
      selectView,
      setViewPickerIsPersisting,
      setViewPickerMode,
      viewPickerInputNameState,
      viewPickerSelectedIconState,
    ],
  );

  const handleDelete = async () => {
    setViewPickerIsPersisting(true);
    selectView(
      viewsOnCurrentObject.filter(
        (view) => view.id !== viewPickerReferenceViewId,
      )[0].id,
    );
    await removeView(viewPickerReferenceViewId);

    setViewPickerIsPersisting(false);
    setViewPickerMode('list');
    closeDropdown();
  };

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
            defaultValue={viewPickerInputName}
            onChange={(event) => setViewPickerInputName(event.target.value)}
            autoFocus
          />
        </StyledIconAndNameContainer>
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <StyledSaveButtonContainer>
          {viewPickerMode === 'create' ? (
            <Button
              title="Create"
              onClick={handleCreate}
              accent="blue"
              size="small"
              fullWidth
              justify="center"
              disabled={viewPickerIsPersisting}
            />
          ) : (
            <Button
              title="Delete"
              onClick={handleDelete}
              accent="danger"
              size="small"
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
