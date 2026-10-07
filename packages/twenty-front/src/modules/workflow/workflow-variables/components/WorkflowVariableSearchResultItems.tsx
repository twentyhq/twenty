import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type WorkflowVariableSearchResult } from '@/workflow/workflow-variables/types/WorkflowVariableSearchResult';
import { useIcons } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';

type WorkflowVariableSearchResultItemsProps = {
  searchResults: WorkflowVariableSearchResult[];
  onSelect: (result: WorkflowVariableSearchResult) => void;
};

export const WorkflowVariableSearchResultItems = ({
  searchResults,
  onSelect,
}: WorkflowVariableSearchResultItemsProps) => {
  const { getIcon } = useIcons();

  return searchResults.map((result) => (
    <Dropdown.OptionItem
      key={JSON.stringify([
        result.stepId,
        result.path,
        result.isLeaf,
        result.isFullRecord,
      ])}
      onSelect={() => onSelect(result)}
      hasSubmenu={!result.isLeaf}
      closeOnSelect={result.isLeaf}
      description={result.breadcrumb}
      startIcon={
        <SelectOptionIcon
          Icon={getIcon(result.icon)}
          color={result.iconColor}
        />
      }
    >
      {result.label}
    </Dropdown.OptionItem>
  ));
};
