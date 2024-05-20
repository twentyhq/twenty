import { ReactNode } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { ObjectFilterDropdownButton } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownButton';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';
import { TopBar } from '@/ui/layout/top-bar/TopBar';
import { QueryParamsFiltersEffect } from '@/views/components/QueryParamsFiltersEffect';
import { QueryParamsViewIdEffect } from '@/views/components/QueryParamsViewIdEffect';
import { ViewBarEffect } from '@/views/components/ViewBarEffect';
import { ViewBarFilterEffect } from '@/views/components/ViewBarFilterEffect';
import { ViewBarPageTitle } from '@/views/components/ViewBarPageTitle';
import { ViewBarSortEffect } from '@/views/components/ViewBarSortEffect';
import { ViewScope } from '@/views/scopes/ViewScope';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewPickerDropdown } from '@/views/view-picker/components/ViewPickerDropdown';
import { useUserOrMetadataLoading } from '~/hooks/useUserOrMetadataLoading';

import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';

export type ViewBarProps = {
  viewBarId: string;
  className?: string;
  optionsDropdownButton: ReactNode;
  onCurrentViewChange: (view: GraphQLView | undefined) => void | Promise<void>;
};

const StyledViewBarSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={140} height={16} />
    </SkeletonTheme>
  );
};

export const ViewBar = ({
  viewBarId,
  className,
  optionsDropdownButton,
  onCurrentViewChange,
}: ViewBarProps) => {
  const { objectNamePlural } = useParams();

  const loading = useUserOrMetadataLoading();

  const filterDropdownId = 'view-filter';
  const sortDropdownId = 'view-sort';

  if (!objectNamePlural) {
    return;
  }

  return (
    <ViewScope
      viewScopeId={viewBarId}
      onCurrentViewChange={onCurrentViewChange}
    >
      <ViewBarEffect viewBarId={viewBarId} />
      <ViewBarFilterEffect filterDropdownId={filterDropdownId} />
      <ViewBarSortEffect sortDropdownId={sortDropdownId} />
      <QueryParamsFiltersEffect />
      <QueryParamsViewIdEffect />

      <ViewBarPageTitle viewBarId={viewBarId} />
      <TopBar
        className={className}
        leftComponent={
          <>
            {loading ? <StyledViewBarSkeletonLoader /> : <ViewPickerDropdown />}
          </>
        }
        displayBottomBorder={false}
        rightComponent={
          <>
            <ObjectFilterDropdownButton
              filterDropdownId={filterDropdownId}
              hotkeyScope={{
                scope: FiltersHotkeyScope.ObjectFilterDropdownButton,
              }}
            />
            <ObjectSortDropdownButton
              sortDropdownId={sortDropdownId}
              hotkeyScope={{
                scope: FiltersHotkeyScope.ObjectSortDropdownButton,
              }}
            />
            {optionsDropdownButton}
          </>
        }
        bottomComponent={
          <ViewBarDetails
            filterDropdownId={filterDropdownId}
            hasFilterButton
            viewBarId={viewBarId}
            rightComponent={
              <UpdateViewButtonGroup
                hotkeyScope={{
                  scope: ViewsHotkeyScope.UpdateViewButtonDropdown,
                }}
              />
            }
          />
        }
      />
    </ViewScope>
  );
};
