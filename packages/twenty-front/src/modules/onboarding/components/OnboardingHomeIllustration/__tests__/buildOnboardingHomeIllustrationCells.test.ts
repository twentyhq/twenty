import { buildOnboardingHomeIllustrationCells } from '@/onboarding/components/OnboardingHomeIllustration/buildOnboardingHomeIllustrationCells';

const COLUMNS = 60;
const ROWS = 90;
const PITCH = 6;
const WALL_LUMINANCE = 0.9;
const CHAIR_LUMINANCE = 0.1;

const getCellIndex = (normalizedX: number, normalizedY: number) =>
  Math.floor(normalizedY * ROWS) * COLUMNS + Math.floor(normalizedX * COLUMNS);

const buildLuminancesWithDarkChair = () => {
  const luminances = new Float32Array(COLUMNS * ROWS).fill(WALL_LUMINANCE);
  const chairSeatCellIndex = getCellIndex(0.6, 0.66);

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
      luminances[chairSeatCellIndex + rowOffset * COLUMNS + columnOffset] =
        CHAIR_LUMINANCE;
    }
  }

  return { luminances, chairSeatCellIndex };
};

describe('buildOnboardingHomeIllustrationCells', () => {
  it('should lay out one cell per grid position from the origin', () => {
    const { luminances } = buildLuminancesWithDarkChair();

    const { cells } = buildOnboardingHomeIllustrationCells({
      luminances,
      columns: COLUMNS,
      rows: ROWS,
      pitch: PITCH,
      originX: 10,
      originY: 20,
    });

    expect(cells).toHaveLength(COLUMNS * ROWS);
    expect(cells[0].x).toBe(10 + PITCH / 2);
    expect(cells[0].y).toBe(20 + PITCH / 2);
  });

  it('should ink the chair only once it has moved in', () => {
    const { luminances, chairSeatCellIndex } = buildLuminancesWithDarkChair();

    const { cells } = buildOnboardingHomeIllustrationCells({
      luminances,
      columns: COLUMNS,
      rows: ROWS,
      pitch: PITCH,
      originX: 0,
      originY: 0,
    });
    const chairSeatCell = cells[chairSeatCellIndex];

    expect(chairSeatCell.furnitureIndex).toBe(0);
    expect(chairSeatCell.photoInk).toBeGreaterThan(0.5);
    expect(chairSeatCell.roomInk).toBe(0);
  });

  it('should keep the same ink for the room with or without furniture', () => {
    const { luminances } = buildLuminancesWithDarkChair();

    const { cells } = buildOnboardingHomeIllustrationCells({
      luminances,
      columns: COLUMNS,
      rows: ROWS,
      pitch: PITCH,
      originX: 0,
      originY: 0,
    });
    const wallCell = cells[getCellIndex(0.3, 0.1)];

    expect(wallCell.furnitureIndex).toBeNull();
    expect(wallCell.roomInk).toBe(wallCell.photoInk);
  });
});
