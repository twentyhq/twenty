import { useCallback, useContext, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { currentViewIdScopedState } from '@/ui/data/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/data/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/data/view-bar/states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '@/ui/data/view-bar/states/savedSortsFamilyState';
import { canPersistFiltersScopedFamilySelector } from '@/ui/data/view-bar/states/selectors/canPersistFiltersScopedFamilySelector';
import { canPersistSortsScopedFamilySelector } from '@/ui/data/view-bar/states/selectors/canPersistSortsScopedFamilySelector';
import { sortsScopedState } from '@/ui/data/view-bar/states/sortsScopedState';
import { viewEditModeState } from '@/ui/data/view-bar/states/viewEditModeState';
import { IconChevronDown, IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { ButtonGroup } from '@/ui/input/button/components/ButtonGroup';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';

import { ViewBarContext } from '../contexts/ViewBarContext';

const StyledContainer = styled.div`
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;
export type UpdateViewButtonGroupProps = {
  hotkeyScope: string;
  onViewEditModeChange?: () => void;
};

export const UpdateViewButtonGroup = ({
  hotkeyScope,
  onViewEditModeChange,
}: UpdateViewButtonGroupProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    canPersistViewFields,
    onCurrentViewSubmit,
    ViewBarRecoilScopeContext,
  } = useContext(ViewBarContext);

  const recoilScopeId = useRecoilScopeId(ViewBarRecoilScopeContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    ViewBarRecoilScopeContext,
  );

  const filters = useRecoilScopedValue(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );
  const setSavedFilters = useSetRecoilState(
    savedFiltersFamilyState(currentViewId),
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedFamilySelector({
      recoilScopeId,
      viewId: currentViewId,
    }),
  );

  const sorts = useRecoilScopedValue(
    sortsScopedState,
    ViewBarRecoilScopeContext,
  );
  const setSavedSorts = useSetRecoilState(savedSortsFamilyState(currentViewId));
  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedFamilySelector({
      recoilScopeId,
      viewId: currentViewId,
    }),
  );

  const setViewEditMode = useSetRecoilState(viewEditModeState);

  const canPersistView =
    currentViewId &&
    (canPersistViewFields || canPersistFilters || canPersistSorts);

  const handleArrowDownButtonClick = useCallback(() => {
    setIsDropdownOpen((previousIsOpen) => !previousIsOpen);
  }, []);

  const handleCreateViewButtonClick = useCallback(() => {
    setViewEditMode({ mode: 'create', viewId: undefined });
    onViewEditModeChange?.();
    setIsDropdownOpen(false);
  }, [setViewEditMode, onViewEditModeChange]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleViewSubmit = async () => {
    if (canPersistFilters) setSavedFilters(filters);
    if (canPersistSorts) setSavedSorts(sorts);

    await onCurrentViewSubmit?.();
  };

  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    handleDropdownClose,
    hotkeyScope,
    [],
  );

  if (!canPersistView) return null;

  return (
    <StyledContainer>
      <ButtonGroup size="small" accent="blue">
        <Button title="Update view" onClick={handleViewSubmit} />
        <Button
          size="small"
          Icon={IconChevronDown}
          onClick={handleArrowDownButtonClick}
        />
      </ButtonGroup>

      {isDropdownOpen && (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={handleCreateViewButtonClick}
            LeftIcon={IconPlus}
            text="Create view"
          />
        </DropdownMenuItemsContainer>
      )}
    </StyledContainer>
  );
};
