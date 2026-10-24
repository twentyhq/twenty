import { CoreObjectFilterButton } from '@/object-core/filters/components/CoreObjectFilterButton';
import { useOpenCoreWorkflowFiltersSidePanel } from '@/object-core/workflows/hooks/useOpenCoreWorkflowFiltersSidePanel';

type CoreWorkflowsFilterButtonProps = {
  isFilterActive: boolean;
};

export const CoreWorkflowsFilterButton = ({
  isFilterActive,
}: CoreWorkflowsFilterButtonProps) => {
  const { openCoreWorkflowFiltersSidePanel } =
    useOpenCoreWorkflowFiltersSidePanel();

  return (
    <CoreObjectFilterButton
      isFilterActive={isFilterActive}
      onClick={openCoreWorkflowFiltersSidePanel}
    />
  );
};
