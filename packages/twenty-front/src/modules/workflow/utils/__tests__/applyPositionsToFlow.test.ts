import { applyPositionsToFlow } from '@/workflow/utils/applyPositionsToFlow';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

describe('applyPositionsToFlow', () => {
  it('writes the given positions on the trigger and the matching steps only', () => {
    const result = applyPositionsToFlow({
      flow: {
        trigger: {},
        steps: [{ id: 'first' }, { id: 'second' }],
      },
      positions: [
        { id: TRIGGER_STEP_ID, position: { x: 1, y: 2 } },
        { id: 'second', position: { x: 3, y: 4 } },
      ],
    });

    expect(result).toEqual({
      trigger: { position: { x: 1, y: 2 } },
      steps: [{ id: 'first' }, { id: 'second', position: { x: 3, y: 4 } }],
    });
  });

  it('clears a position given as undefined', () => {
    expect(
      applyPositionsToFlow({
        flow: {
          trigger: { position: { x: 1, y: 2 } },
          steps: [{ id: 'first', position: { x: 3, y: 4 } }],
        },
        positions: [
          { id: TRIGGER_STEP_ID, position: undefined },
          { id: 'first', position: undefined },
        ],
      }),
    ).toEqual({
      trigger: { position: undefined },
      steps: [{ id: 'first', position: undefined }],
    });
  });

  it('returns an undefined flow unchanged', () => {
    expect(
      applyPositionsToFlow({ flow: undefined, positions: [] }),
    ).toBeUndefined();
  });
});
