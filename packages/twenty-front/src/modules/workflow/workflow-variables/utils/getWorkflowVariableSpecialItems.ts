import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isIteratorOutputSchema } from '@/workflow/workflow-variables/types/guards/isIteratorOutputSchema';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { isFlattenedArrayOutputSchema } from 'twenty-shared/workflow';

export type WorkflowVariableSpecialItemId = 'wholeIteratorItem' | 'wholeList';

export type WorkflowVariableSpecialItem = {
  id: WorkflowVariableSpecialItemId;
  label: string;
  contextualText: string;
  iconName: string;
  path: string[];
};

const matchesSearch = (label: string, searchInputValue?: string): boolean =>
  !isDefined(searchInputValue) ||
  label.toLowerCase().includes(searchInputValue.toLowerCase());

export const getWorkflowVariableSpecialItems = ({
  step,
  currentPath,
  searchInputValue,
}: {
  step: StepOutputSchemaV2;
  currentPath: string[];
  searchInputValue?: string;
}): WorkflowVariableSpecialItem[] => {
  const specialItems: WorkflowVariableSpecialItem[] = [];

  const iteratorCurrentItemNode = isIteratorOutputSchema(
    step.type,
    step.outputSchema,
  )
    ? step.outputSchema.currentItem
    : undefined;

  const isViewingIteratorCurrentItem =
    isDefined(iteratorCurrentItemNode) &&
    !iteratorCurrentItemNode.isLeaf &&
    currentPath.length === 1 &&
    currentPath[0] === 'currentItem';

  if (
    isViewingIteratorCurrentItem &&
    matchesSearch(iteratorCurrentItemNode.label, searchInputValue)
  ) {
    specialItems.push({
      id: 'wholeIteratorItem',
      label: iteratorCurrentItemNode.label,
      contextualText: t`Use the whole item`,
      iconName: iteratorCurrentItemNode.icon ?? 'IconBraces',
      path: currentPath,
    });
  }

  const isStepOutputFlattenedArray =
    isBaseOutputSchemaV2(step.outputSchema) &&
    isFlattenedArrayOutputSchema(step.outputSchema);

  const wholeListLabel = t`Whole list`;

  if (
    isStepOutputFlattenedArray &&
    currentPath.length === 0 &&
    matchesSearch(wholeListLabel, searchInputValue)
  ) {
    specialItems.push({
      id: 'wholeList',
      label: wholeListLabel,
      contextualText: t`Use the whole list`,
      iconName: 'IconListDetails',
      path: [],
    });
  }

  return specialItems;
};
