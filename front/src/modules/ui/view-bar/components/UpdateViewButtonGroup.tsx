import { type Context, useCallback, useContext, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { Button } from '@/ui/button/components/Button';
import { ButtonGroup } from '@/ui/button/components/ButtonGroup';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { IconChevronDown, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { DropdownMenuContainer } from '@/ui/view-bar/components/DropdownMenuContainer';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/view-bar/states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '@/ui/view-bar/states/savedSortsFamilyState';
import { canPersistFiltersScopedFamilySelector } from '@/ui/view-bar/states/selectors/canPersistFiltersScopedFamilySelector';
import { canPersistSortsScopedFamilySelector } from '@/ui/view-bar/states/selectors/canPersistSortsScopedFamilySelector';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';

import { ViewBarContext } from '../contexts/ViewBarContext';

const StyledContainer = styled.div`
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

export type UpdateViewButtonGroupProps = {
  hotkeyScope: string;
  onViewEditModeChange?: () => void;
  scopeContext: Context<string | null>;
};

export const UpdateViewButtonGroup = ({
  hotkeyScope,
  onViewEditModeChange,
  scopeContext,
}: UpdateViewButtonGroupProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { canPersistViewFields, onCurrentViewSubmit } =
    useContext(ViewBarContext);
  const recoilScopeId = useContextScopeId(scopeContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    scopeContext,
  );

  const filters = useRecoilScopedValue(filtersScopedState, scopeContext);
  const setSavedFilters = useSetRecoilState(
    savedFiltersFamilyState(currentViewId),
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedFamilySelector([recoilScopeId, currentViewId]),
  );

  const sorts = useRecoilScopedValue(sortsScopedState, scopeContext);
  const setSavedSorts = useSetRecoilState(savedSortsFamilyState(currentViewId));
  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedFamilySelector([recoilScopeId, currentViewId]),
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
        <DropdownMenuContainer onClose={handleDropdownClose}>
          <StyledDropdownMenuItemsContainer>
            <MenuItem
              onClick={handleCreateViewButtonClick}
              LeftIcon={IconPlus}
              text="Create view"
            />
          </StyledDropdownMenuItemsContainer>
        </DropdownMenuContainer>
      )}
    </StyledContainer>
  );
};
