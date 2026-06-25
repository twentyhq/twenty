import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isIteratorOutputSchema } from '@/workflow/workflow-variables/types/guards/isIteratorOutputSchema';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { isFlattenedArrayOutputSchema } from 'twenty-shared/workflow';

// "Special" variable entries are whole-value selections that sit above the
// per-field list in the dropdown: the iterator's current item picked as a whole,
// or a step's top-level array picked as a whole list. Keeping their visibility
// rules here (out of the component) makes them easy to test and extend.
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

  // Inside an iterator's current item, let the user select the whole (non-leaf)
  // item, not only one of its fields.
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

  // A step returning a top-level array (stored as a flattened array schema) can
  // be selected as a whole to feed an iterator downstream.
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
