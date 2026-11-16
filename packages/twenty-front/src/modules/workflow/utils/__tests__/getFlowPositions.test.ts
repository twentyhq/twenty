import { getFlowPositions } from '@/workflow/utils/getFlowPositions';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

describe('getFlowPositions', () => {
  it('lists the trigger and every step, unpositioned ones included', () => {
    expect(
      getFlowPositions({
        trigger: { position: null },
        steps: [{ id: 'first', position: { x: 3, y: 4 } }, { id: 'second' }],
      }),
    ).toEqual([
      { id: TRIGGER_STEP_ID, position: undefined },
      { id: 'first', position: { x: 3, y: 4 } },
      { id: 'second', position: undefined },
    ]);
  });
});
