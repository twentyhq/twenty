import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type WorkflowVariableSearchResult } from '@/workflow/workflow-variables/types/WorkflowVariableSearchResult';
import { useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
    <ListItem
      key={JSON.stringify([
        result.stepId,
        result.path,
        result.isLeaf,
        result.isFullRecord,
      ])}
      focused={false}
      onClick={() => onSelect(result)}
      role="option"
      aria-selected={false}
      selected={false}
      indicator="check"
      hasSubmenu={!result.isLeaf}
      description={result.breadcrumb}
      startIcon={
        <SelectOptionIcon
          Icon={getIcon(result.icon)}
          color={result.iconColor}
        />
      }
    >
      {result.label}
    </ListItem>
  ));
};
