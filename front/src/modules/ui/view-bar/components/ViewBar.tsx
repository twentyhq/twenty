import { ComponentProps, type ComponentType, type Context } from 'react';
import { useRecoilValue } from 'recoil';

import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { TopBar } from '@/ui/top-bar/TopBar';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { canPersistFiltersScopedFamilySelector } from '../states/selectors/canPersistFiltersScopedFamilySelector';
import { canPersistSortsScopedFamilySelector } from '../states/selectors/canPersistSortsScopedFamilySelector';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { FilterDropdownButton } from './FilterDropdownButton';
import {
  SortDropdownButton,
  SortDropdownButtonProps,
} from './SortDropdownButton';
import {
  UpdateViewButtonGroup,
  UpdateViewButtonGroupProps,
} from './UpdateViewButtonGroup';
import ViewBarDetails from './ViewBarDetails';
import {
  ViewsDropdownButton,
  ViewsDropdownButtonProps,
} from './ViewsDropdownButton';

export type ViewBarProps<SortField> = ComponentProps<'div'> & {
  canPersistViewFields?: boolean;
  OptionsDropdownButton: ComponentType;
  optionsDropdownKey: string;
  scopeContext: Context<string | null>;
} & Pick<
    ViewsDropdownButtonProps,
    'defaultViewName' | 'onViewsChange' | 'onViewSelect'
  > &
  Pick<SortDropdownButtonProps<SortField>, 'availableSorts'> &
  Pick<UpdateViewButtonGroupProps, 'onViewSubmit'>;

export const ViewBar = <SortField,>({
  availableSorts,
  canPersistViewFields,
  defaultViewName,
  onViewsChange,
  onViewSelect,
  onViewSubmit,
  OptionsDropdownButton,
  optionsDropdownKey,
  scopeContext,
  ...props
}: ViewBarProps<SortField>) => {
  const recoilScopeId = useContextScopeId(scopeContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    scopeContext,
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedFamilySelector([recoilScopeId, currentViewId]),
  );
  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedFamilySelector([recoilScopeId, currentViewId]),
  );

  const { openDropdownButton: openOptionsDropdownButton } = useDropdownButton({
    key: optionsDropdownKey,
  });

  return (
    <TopBar
      {...props}
      leftComponent={
        <ViewsDropdownButton
          defaultViewName={defaultViewName}
          onViewEditModeChange={openOptionsDropdownButton}
          onViewsChange={onViewsChange}
          onViewSelect={onViewSelect}
          HotkeyScope={ViewsHotkeyScope.ListDropdown}
          scopeContext={scopeContext}
        />
      }
      displayBottomBorder={false}
      rightComponent={
        <>
          <FilterDropdownButton
            context={scopeContext}
            HotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            isPrimaryButton
          />
          <SortDropdownButton<SortField>
            context={scopeContext}
            availableSorts={availableSorts}
            HotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            isPrimaryButton
          />
          <OptionsDropdownButton />
        </>
      }
      bottomComponent={
        <ViewBarDetails
          canPersistView={
            canPersistViewFields || canPersistFilters || canPersistSorts
          }
          context={scopeContext}
          hasFilterButton
          rightComponent={
            <UpdateViewButtonGroup
              onViewEditModeChange={openOptionsDropdownButton}
              onViewSubmit={onViewSubmit}
              HotkeyScope={ViewsHotkeyScope.CreateDropdown}
              scopeContext={scopeContext}
            />
          }
        />
      }
    />
  );
};
