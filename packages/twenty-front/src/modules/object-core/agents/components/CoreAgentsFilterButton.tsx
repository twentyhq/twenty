import { useOpenCoreAgentFiltersSidePanel } from '@/object-core/agents/hooks/useOpenCoreAgentFiltersSidePanel';
import { CoreObjectFilterButton } from '@/object-core/filters/components/CoreObjectFilterButton';

type CoreAgentsFilterButtonProps = {
  isFilterActive: boolean;
};

export const CoreAgentsFilterButton = ({
  isFilterActive,
}: CoreAgentsFilterButtonProps) => {
  const { openCoreAgentFiltersSidePanel } = useOpenCoreAgentFiltersSidePanel();

  return (
    <CoreObjectFilterButton
      isFilterActive={isFilterActive}
      onClick={openCoreAgentFiltersSidePanel}
    />
  );
};
