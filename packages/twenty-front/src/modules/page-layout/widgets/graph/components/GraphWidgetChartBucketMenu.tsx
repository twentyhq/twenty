import { useApplyDashboardCrossFilter } from '@/page-layout/dashboard-filters/hooks/useApplyDashboardCrossFilter';
import { graphWidgetChartBucketMenuComponentState } from '@/page-layout/widgets/graph/states/graphWidgetChartBucketMenuComponentState';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { getGraphWidgetChartBucketMenuDropdownId } from '@/page-layout/widgets/graph/utils/getGraphWidgetChartBucketMenuDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components/navigation';
import { IconFilter, IconTable } from 'twenty-ui/icon';

// A zero-size anchor at the click position; always mounted so the dropdown has its reference before it opens.
const StyledMenuAnchor = styled.div<{ left: string; top: string }>`
  height: 0;
  left: ${({ left }) => left};
  pointer-events: none;
  position: fixed;
  top: ${({ top }) => top};
  width: 0;
`;

type GraphWidgetChartBucketMenuProps = {
  widgetId: string;
  onOpenRecords?: (bucketRawValue: RawDimensionValue) => void;
};

export const GraphWidgetChartBucketMenu = ({
  widgetId,
  onOpenRecords,
}: GraphWidgetChartBucketMenuProps) => {
  const { t } = useLingui();

  const dropdownId = useWorkspaceSurfaceScopedComponentInstanceId(
    getGraphWidgetChartBucketMenuDropdownId(widgetId),
  );

  const [graphWidgetChartBucketMenu, setGraphWidgetChartBucketMenu] =
    useAtomComponentState(graphWidgetChartBucketMenuComponentState);

  const { applyDashboardCrossFilter } = useApplyDashboardCrossFilter();
  const { closeDropdown } = useCloseDropdown();

  const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(
    null,
  );

  const handleFilterDashboardClick = () => {
    if (!isDefined(graphWidgetChartBucketMenu)) {
      return;
    }

    applyDashboardCrossFilter({
      slotId: graphWidgetChartBucketMenu.slotId,
      value: graphWidgetChartBucketMenu.value,
    });
    closeDropdown(dropdownId);
  };

  const handleOpenRecordsClick = () => {
    if (!isDefined(graphWidgetChartBucketMenu) || !isDefined(onOpenRecords)) {
      return;
    }

    closeDropdown(dropdownId);
    onOpenRecords(graphWidgetChartBucketMenu.bucketRawValue);
  };

  const handleClose = () => {
    setGraphWidgetChartBucketMenu(null);
  };

  const anchorPosition = graphWidgetChartBucketMenu?.anchorPosition;

  return (
    <>
      <StyledMenuAnchor
        ref={setAnchorElement}
        left={`${anchorPosition?.x ?? 0}px`}
        top={`${anchorPosition?.y ?? 0}px`}
      />
      <Dropdown
        dropdownId={dropdownId}
        positionReference={anchorElement}
        dropdownPlacement="bottom-start"
        onClose={handleClose}
        dropdownComponents={
          <LegacyDropdownContent
            widthInPixels={GenericDropdownContentWidth.Medium}
          >
            <DropdownMenuItemsContainer>
              <MenuItem
                LeftIcon={IconFilter}
                text={t`Filter dashboard by this`}
                onClick={handleFilterDashboardClick}
              />
              {isDefined(onOpenRecords) && (
                <MenuItem
                  LeftIcon={IconTable}
                  text={t`Open records`}
                  onClick={handleOpenRecordsClick}
                />
              )}
            </DropdownMenuItemsContainer>
          </LegacyDropdownContent>
        }
      />
    </>
  );
};
