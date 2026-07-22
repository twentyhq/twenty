import { resolveDropTarget } from '@/ui/utilities/drag-and-drop/utils/resolveDropTarget';

const cardShape = { boundingRectangle: { top: 100, height: 40 } };

describe('resolveDropTarget', () => {
  it('should target the card position when the pointer is above its midpoint', () => {
    const result = resolveDropTarget({
      pointerY: 110,
      cardPosition: 2,
      cardShape,
    });

    expect(result.dropTargetIndex).toBe(2);
  });

  it('should target the slot after the card when the pointer is below its midpoint', () => {
    const result = resolveDropTarget({
      pointerY: 130,
      cardPosition: 2,
      cardShape,
    });

    expect(result.dropTargetIndex).toBe(3);
  });

  it('should target the slot after the card when the pointer is exactly on the midpoint', () => {
    const result = resolveDropTarget({
      pointerY: 120,
      cardPosition: 2,
      cardShape,
    });

    expect(result.dropTargetIndex).toBe(3);
  });

  it('should target the card position when the pointer is above the card top', () => {
    const result = resolveDropTarget({
      pointerY: 80,
      cardPosition: 2,
      cardShape,
    });

    expect(result.dropTargetIndex).toBe(2);
  });

  it('should target the slot after the card when the pointer is below the card bottom', () => {
    const result = resolveDropTarget({
      pointerY: 180,
      cardPosition: 2,
      cardShape,
    });

    expect(result.dropTargetIndex).toBe(3);
  });
});
