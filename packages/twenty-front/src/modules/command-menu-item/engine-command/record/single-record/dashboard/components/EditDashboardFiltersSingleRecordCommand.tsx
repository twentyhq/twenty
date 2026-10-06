import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useOpenDashboardFiltersInSidePanel } from '@/side-panel/hooks/useOpenDashboardFiltersInSidePanel';

export const EditDashboardFiltersSingleRecordCommand = () => {
  const { openDashboardFiltersInSidePanel } =
    useOpenDashboardFiltersInSidePanel();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={openDashboardFiltersInSidePanel}
    />
  );
};
