import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';

describe('getActionIcon', () => {
  it('should return correct icon for all action types', () => {
    RECORD_ACTIONS.forEach((action) => {
      expect(getActionIcon(action.type)).toBe(action.icon);
    });

    AI_ACTIONS.forEach((action) => {
      expect(getActionIcon(action.type)).toBe(action.icon);
    });

    CORE_ACTIONS.forEach((action) => {
      expect(getActionIcon(action.type)).toBe(action.icon);
    });

    HUMAN_INPUT_ACTIONS.forEach((action) => {
      expect(getActionIcon(action.type)).toBe(action.icon);
    });
  });

  it('should return IconDefault for unknown action type', () => {
    // @ts-expect-error Testing invalid action type
    expect(getActionIcon('UNKNOWN_ACTION')).toBe('IconDefault');
  });
});
