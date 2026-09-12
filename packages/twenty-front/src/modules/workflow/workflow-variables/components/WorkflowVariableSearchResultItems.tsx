import { type WorkflowVariableSearchResult } from '@/workflow/workflow-variables/types/WorkflowVariableSearchResult';
import { useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';

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
    <MenuItemSelect
      key={JSON.stringify([
        result.stepId,
        result.path,
        result.isLeaf,
        result.isFullRecord,
      ])}
      selected={false}
      focused={false}
      onClick={() => onSelect(result)}
      text={result.label}
      contextualText={result.breadcrumb}
      LeftIcon={getIcon(result.icon)}
      leftIconColor={result.iconColor}
      hasSubMenu={!result.isLeaf}
    />
  ));
};
