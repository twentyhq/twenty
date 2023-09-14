import type { ComponentProps, Context, ReactNode } from 'react';

import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { TopBar } from '@/ui/top-bar/TopBar';

import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { FilterDropdownButton } from './FilterDropdownButton';
import { SortDropdownButton } from './SortDropdownButton';
import {
  UpdateViewButtonGroup,
  type UpdateViewButtonGroupProps,
} from './UpdateViewButtonGroup';
import ViewBarDetails, { type ViewBarDetailsProps } from './ViewBarDetails';
import {
  ViewsDropdownButton,
  type ViewsDropdownButtonProps,
} from './ViewsDropdownButton';

export type ViewBarProps = ComponentProps<'div'> & {
  optionsDropdownButton: ReactNode;
  optionsDropdownKey: string;
  scopeContext: Context<string | null>;
} & Pick<
    ViewsDropdownButtonProps,
    'defaultViewName' | 'onViewsChange' | 'onViewSelect'
  > &
  Pick<ViewBarDetailsProps, 'canPersistViewFields' | 'onReset'> &
  Pick<UpdateViewButtonGroupProps, 'onViewSubmit'>;

export const ViewBar = ({
  canPersistViewFields,
  defaultViewName,
  onReset,
  onViewsChange,
  onViewSelect,
  onViewSubmit,
  optionsDropdownButton,
  optionsDropdownKey,
  scopeContext,
  ...props
}: ViewBarProps) => {
  const { openDropdownButton: openOptionsDropdownButton } = useDropdownButton({
    dropdownId: optionsDropdownKey,
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
          hotkeyScope={{ scope: ViewsHotkeyScope.ListDropdown }}
          scopeContext={scopeContext}
        />
      }
      displayBottomBorder={false}
      rightComponent={
        <>
          <FilterDropdownButton
            hotkeyScope={{ scope: FiltersHotkeyScope.FilterDropdownButton }}
            context={scopeContext}
          />
          <SortDropdownButton
            context={scopeContext}
            hotkeyScope={{ scope: FiltersHotkeyScope.FilterDropdownButton }}
            isPrimaryButton
          />
          {optionsDropdownButton}
        </>
      }
      bottomComponent={
        <ViewBarDetails
          canPersistViewFields={canPersistViewFields}
          context={scopeContext}
          hasFilterButton
          onReset={onReset}
          rightComponent={
            <UpdateViewButtonGroup
              canPersistViewFields={canPersistViewFields}
              onViewEditModeChange={openOptionsDropdownButton}
              onViewSubmit={onViewSubmit}
              hotkeyScope={ViewsHotkeyScope.CreateDropdown}
              scopeContext={scopeContext}
            />
          }
        />
      }
    />
  );
};
