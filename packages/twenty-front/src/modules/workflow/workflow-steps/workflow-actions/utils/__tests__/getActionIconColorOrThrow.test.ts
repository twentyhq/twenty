import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { themeCssVariables } from 'twenty-ui/theme-constants';

describe('getActionIconColorOrThrow', () => {
  it('returns red9 for CODE, HTTP_REQUEST, SEND_EMAIL, DRAFT_EMAIL, LOGIC_FUNCTION', () => {
    const redActions: WorkflowActionType[] = [
      'CODE',
      'HTTP_REQUEST',
      'SEND_EMAIL',
      'DRAFT_EMAIL',
      'LOGIC_FUNCTION',
      'CREATE_CALENDAR_EVENT',
    ];
    redActions.forEach((actionType) => {
      expect(getActionIconColorOrThrow(actionType)).toBe(
        themeCssVariables.color.red9,
      );
    });
  });

  it('returns gray9 for record actions', () => {
    const recordActions: WorkflowActionType[] = [
      'CREATE_RECORD',
      'UPDATE_RECORD',
      'DELETE_RECORD',
      'UPSERT_RECORD',
      'FIND_RECORDS',
      'PICK_RECORD',
    ];
    recordActions.forEach((actionType) => {
      expect(getActionIconColorOrThrow(actionType)).toBe(
        themeCssVariables.color.gray9,
      );
    });
  });

  it('returns orange9 for FORM', () => {
    expect(getActionIconColorOrThrow('FORM')).toBe(
      themeCssVariables.color.orange9,
    );
  });

  it('returns green9 for ITERATOR, EMPTY, FILTER, IF_ELSE, DELAY', () => {
    const greenActions: WorkflowActionType[] = [
      'ITERATOR',
      'EMPTY',
      'FILTER',
      'IF_ELSE',
      'DELAY',
    ];
    greenActions.forEach((actionType) => {
      expect(getActionIconColorOrThrow(actionType)).toBe(
        themeCssVariables.color.green9,
      );
    });
  });

  it.each(['AI_AGENT', 'CLASSIFY'] as const)(
    'returns pink9 for %s',
    (actionType) => {
      expect(getActionIconColorOrThrow(actionType)).toBe(
        themeCssVariables.color.pink9,
      );
    },
  );

  it('returns consistent values for repeated calls', () => {
    expect(getActionIconColorOrThrow('CODE')).toBe(
      getActionIconColorOrThrow('CODE'),
    );
  });
});
