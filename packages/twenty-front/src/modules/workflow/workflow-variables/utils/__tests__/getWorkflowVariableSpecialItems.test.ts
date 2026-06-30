import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getWorkflowVariableSpecialItems } from '@/workflow/workflow-variables/utils/getWorkflowVariableSpecialItems';

const ITERATOR_STEP_WITH_OBJECT_CURRENT_ITEM: StepOutputSchemaV2 = {
  id: 'step-1',
  name: 'Loop',
  type: 'ITERATOR',
  outputSchema: {
    currentItem: {
      isLeaf: false,
      icon: 'IconUser',
      label: 'Current Item',
      value: {} as never,
    },
    currentItemIndex: 0,
    hasProcessedAllItems: false,
  },
};

const CODE_STEP_WITH_FLATTENED_ARRAY: StepOutputSchemaV2 = {
  id: 'step-2',
  name: 'Run code',
  type: 'CODE',
  outputSchema: {
    '0': { isLeaf: true, type: 'string', label: '0', value: 'a' },
    '1': { isLeaf: true, type: 'string', label: '1', value: 'b' },
  },
};

const CODE_STEP_WITH_OBJECT_OUTPUT: StepOutputSchemaV2 = {
  id: 'step-3',
  name: 'Run code',
  type: 'CODE',
  outputSchema: {
    message: { isLeaf: true, type: 'string', label: 'message', value: 'hi' },
  },
};

describe('getWorkflowVariableSpecialItems', () => {
  it('should offer the whole iterator item when viewing a non-leaf currentItem', () => {
    const specialItems = getWorkflowVariableSpecialItems({
      step: ITERATOR_STEP_WITH_OBJECT_CURRENT_ITEM,
      currentPath: ['currentItem'],
    });

    expect(specialItems).toEqual([
      {
        id: 'wholeIteratorItem',
        label: 'Current Item',
        contextualText: 'Use the whole item',
        iconName: 'IconUser',
        path: ['currentItem'],
      },
    ]);
  });

  it('should not offer the whole iterator item outside of the currentItem path', () => {
    const specialItems = getWorkflowVariableSpecialItems({
      step: ITERATOR_STEP_WITH_OBJECT_CURRENT_ITEM,
      currentPath: [],
    });

    expect(specialItems).toEqual([]);
  });

  it('should offer the whole list when a step output is a flattened array', () => {
    const specialItems = getWorkflowVariableSpecialItems({
      step: CODE_STEP_WITH_FLATTENED_ARRAY,
      currentPath: [],
    });

    expect(specialItems).toEqual([
      {
        id: 'wholeList',
        label: 'Whole list',
        contextualText: 'Use the whole list',
        iconName: 'IconListDetails',
        path: [],
      },
    ]);
  });

  it('should not offer the whole list when navigating inside the array', () => {
    const specialItems = getWorkflowVariableSpecialItems({
      step: CODE_STEP_WITH_FLATTENED_ARRAY,
      currentPath: ['0'],
    });

    expect(specialItems).toEqual([]);
  });

  it('should not offer any special item for a regular object output', () => {
    const specialItems = getWorkflowVariableSpecialItems({
      step: CODE_STEP_WITH_OBJECT_OUTPUT,
      currentPath: [],
    });

    expect(specialItems).toEqual([]);
  });

  it('should hide the whole list when it does not match the search', () => {
    const specialItems = getWorkflowVariableSpecialItems({
      step: CODE_STEP_WITH_FLATTENED_ARRAY,
      currentPath: [],
      searchInputValue: 'zzz',
    });

    expect(specialItems).toEqual([]);
  });

  it('should keep the whole list when it matches the search', () => {
    const specialItems = getWorkflowVariableSpecialItems({
      step: CODE_STEP_WITH_FLATTENED_ARRAY,
      currentPath: [],
      searchInputValue: 'whole',
    });

    expect(specialItems).toHaveLength(1);
    expect(specialItems[0].id).toBe('wholeList');
  });
});
