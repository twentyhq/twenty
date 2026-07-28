import { computeLabelIdentifierViewFieldPosition } from 'src/database/commands/upgrade-version-command/2-25/utils/compute-label-identifier-view-field-position.util';

describe('computeLabelIdentifierViewFieldPosition', () => {
  it('should keep the standard position when the view has no other column', () => {
    expect(
      computeLabelIdentifierViewFieldPosition({
        otherViewFieldPositions: [],
        standardPosition: 0,
      }),
    ).toBe(0);
  });

  it('should go below a column already sitting at the standard position', () => {
    expect(
      computeLabelIdentifierViewFieldPosition({
        otherViewFieldPositions: [0, 1, 2],
        standardPosition: 0,
      }),
    ).toBe(-1);
  });

  it('should go below the lowest column when the view was reordered', () => {
    expect(
      computeLabelIdentifierViewFieldPosition({
        otherViewFieldPositions: [7, 3, 12],
        standardPosition: 0,
      }),
    ).toBe(-1);
  });

  it('should go below columns already at negative positions', () => {
    expect(
      computeLabelIdentifierViewFieldPosition({
        otherViewFieldPositions: [-4, 0, 2],
        standardPosition: 0,
      }),
    ).toBe(-5);
  });

  it('should handle fractional positions', () => {
    expect(
      computeLabelIdentifierViewFieldPosition({
        otherViewFieldPositions: [0.5, 1],
        standardPosition: 0,
      }),
    ).toBe(-1);
  });

  it('should always land strictly below every other column', () => {
    const cases = [[0, 1, 2], [-4, 0, 2], [7, 3, 12], [0.5, 1], [0]];

    cases.forEach((otherViewFieldPositions) => {
      const position = computeLabelIdentifierViewFieldPosition({
        otherViewFieldPositions,
        standardPosition: 0,
      });

      expect(position).toBeLessThan(Math.min(...otherViewFieldPositions));
    });
  });
});
