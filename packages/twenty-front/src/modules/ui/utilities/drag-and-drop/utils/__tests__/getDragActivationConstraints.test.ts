import { PointerActivationConstraints } from '@dnd-kit/dom';

import { getDragActivationConstraints } from '@/ui/utilities/drag-and-drop/utils/getDragActivationConstraints';

const createPointerEvent = (pointerType: string) =>
  ({ pointerType }) as unknown as PointerEvent;

describe('getDragActivationConstraints', () => {
  it('should require a press and hold when the pointer is a touch', () => {
    const [constraint, ...otherConstraints] = getDragActivationConstraints(
      createPointerEvent('touch'),
    );

    expect(constraint).toBeInstanceOf(PointerActivationConstraints.Delay);
    expect(otherConstraints).toHaveLength(0);
  });

  it.each(['mouse', 'pen'])(
    'should require a movement distance when the pointer is a %s',
    (pointerType) => {
      const [constraint, ...otherConstraints] = getDragActivationConstraints(
        createPointerEvent(pointerType),
      );

      expect(constraint).toBeInstanceOf(PointerActivationConstraints.Distance);
      expect(otherConstraints).toHaveLength(0);
    },
  );
});
