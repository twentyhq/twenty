import { calculateHandlePosition } from '@/settings/data-model/graph-overview/utils/calculateHandlePosition';
describe('calculatePosition', () => {
  test('should calculate source handle', () => {
    // Source node right from start of target node
    expect(calculateHandlePosition(220, 1000, 220, 540, 'source')).toBe('left');
    expect(calculateHandlePosition(220, 600, 220, 540, 'source')).toBe('left');
    // Source node left from start of target node
    expect(calculateHandlePosition(220, 0, 220, 540, 'source')).toBe('right');
  });

  test('should calculate target handle', () => {
    // Source node right from start of target node
    expect(calculateHandlePosition(220, 1200, 220, 540, 'target')).toBe(
      'right',
    );
    // Source node left from start of target node
    expect(calculateHandlePosition(220, 0, 220, 540, 'target')).toBe('left');
  });
});
