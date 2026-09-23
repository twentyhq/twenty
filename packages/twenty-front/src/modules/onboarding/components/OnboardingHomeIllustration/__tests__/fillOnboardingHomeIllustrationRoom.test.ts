import { fillOnboardingHomeIllustrationRoom } from '@/onboarding/components/OnboardingHomeIllustration/fillOnboardingHomeIllustrationRoom';

describe('fillOnboardingHomeIllustrationRoom', () => {
  it('should keep the room cells untouched', () => {
    const luminances = Float32Array.from([0.2, 0.4, 0.6, 0.8]);

    const roomLuminances = fillOnboardingHomeIllustrationRoom({
      luminances,
      isFurnitureCell: Uint8Array.from([0, 0, 0, 0]),
      columns: 2,
      rows: 2,
    });

    expect(Array.from(roomLuminances)).toEqual(Array.from(luminances));
  });

  it('should paint the wall behind a piece of furniture', () => {
    const wallLuminance = 0.9;
    const columns = 5;
    const rows = 5;
    const luminances = new Float32Array(columns * rows).fill(wallLuminance);
    const isFurnitureCell = new Uint8Array(columns * rows);
    const furnitureCellIndex = 2 * columns + 2;
    luminances[furnitureCellIndex] = 0.1;
    isFurnitureCell[furnitureCellIndex] = 1;

    const roomLuminances = fillOnboardingHomeIllustrationRoom({
      luminances,
      isFurnitureCell,
      columns,
      rows,
    });

    expect(roomLuminances[furnitureCellIndex]).toBeCloseTo(wallLuminance);
  });

  it('should blend the surrounding room across a wide piece of furniture', () => {
    const columns = 5;
    const luminances = Float32Array.from([0.2, 0.1, 0.1, 0.1, 0.8]);

    const roomLuminances = fillOnboardingHomeIllustrationRoom({
      luminances,
      isFurnitureCell: Uint8Array.from([0, 1, 1, 1, 0]),
      columns,
      rows: 1,
    });

    expect(roomLuminances[1]).toBeCloseTo(0.35);
    expect(roomLuminances[2]).toBeCloseTo(0.5);
    expect(roomLuminances[3]).toBeCloseTo(0.65);
  });
});
