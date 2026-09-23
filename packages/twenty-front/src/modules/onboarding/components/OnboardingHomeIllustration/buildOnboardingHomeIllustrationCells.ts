import { fillOnboardingHomeIllustrationRoom } from '@/onboarding/components/OnboardingHomeIllustration/fillOnboardingHomeIllustrationRoom';
import { type OnboardingHomeIllustrationCell } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationCell.type';
import { ONBOARDING_HOME_ILLUSTRATION_FURNITURE } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationFurniture';
import { type OnboardingHomeIllustrationPoint } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationFurniture.type';
import { ONBOARDING_HOME_ILLUSTRATION_ROOM_LINES } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationRoomLines';

const TAU = Math.PI * 2;
const NO_FURNITURE = -1;
const SUBSAMPLES_PER_AXIS = 3;
const MINIMUM_SUBSAMPLES_INSIDE_FURNITURE = 5;
const WHITE_POINT_LUMINANCE = 0.72;
const BLACK_POINT_LUMINANCE = 0.1;
const INK_GAMMA = 0.9;
const MAXIMUM_INK = 0.94;
const HORIZONTAL_EDGE_FADE_RATIO = 0.14;
const TOP_EDGE_FADE_RATIO = 0.08;
const BOTTOM_EDGE_FADE_RATIO = 0.24;
const REVEAL_SWEEP_SECONDS = 0.45;
const REVEAL_JITTER_SECONDS = 0.12;
const FINALE_STAGGER_SECONDS = 0.35;
const FINALE_JITTER_SECONDS = 0.15;
const FINALE_SCATTER_MINIMUM_RATIO = 0.12;
const FINALE_SCATTER_RANGE_RATIO = 0.18;

const clampToUnitRange = (value: number) => Math.max(0, Math.min(1, value));

const smoothStep = (edgeStart: number, edgeEnd: number, value: number) => {
  const ratio = clampToUnitRange((value - edgeStart) / (edgeEnd - edgeStart));
  return ratio * ratio * (3 - 2 * ratio);
};

const pseudoRandomFromSeed = (seed: number) => {
  const noise = Math.sin(seed) * 43758.5453;
  return noise - Math.floor(noise);
};

const isPointInPolygon = (
  pointX: number,
  pointY: number,
  polygon: readonly OnboardingHomeIllustrationPoint[],
) => {
  let isInside = false;

  for (
    let vertexIndex = 0, previousVertexIndex = polygon.length - 1;
    vertexIndex < polygon.length;
    previousVertexIndex = vertexIndex++
  ) {
    const [vertexX, vertexY] = polygon[vertexIndex];
    const [previousVertexX, previousVertexY] = polygon[previousVertexIndex];
    const crossesRay =
      vertexY > pointY !== previousVertexY > pointY &&
      pointX <
        ((previousVertexX - vertexX) * (pointY - vertexY)) /
          (previousVertexY - vertexY) +
          vertexX;

    if (crossesRay) {
      isInside = !isInside;
    }
  }

  return isInside;
};

const getFurnitureIndexByCell = (columns: number, rows: number) => {
  const furnitureIndexByCell = new Int8Array(columns * rows).fill(NO_FURNITURE);
  const polygonBounds = ONBOARDING_HOME_ILLUSTRATION_FURNITURE.map(
    ({ polygon }) => ({
      minimumX: Math.min(...polygon.map(([pointX]) => pointX)),
      maximumX: Math.max(...polygon.map(([pointX]) => pointX)),
      minimumY: Math.min(...polygon.map(([, pointY]) => pointY)),
      maximumY: Math.max(...polygon.map(([, pointY]) => pointY)),
    }),
  );

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const cellCenterX = (column + 0.5) / columns;
      const cellCenterY = (row + 0.5) / rows;

      const furnitureIndex = ONBOARDING_HOME_ILLUSTRATION_FURNITURE.findIndex(
        ({ polygon }, candidateIndex) => {
          const bounds = polygonBounds[candidateIndex];
          if (
            cellCenterX < bounds.minimumX - 1 / columns ||
            cellCenterX > bounds.maximumX + 1 / columns ||
            cellCenterY < bounds.minimumY - 1 / rows ||
            cellCenterY > bounds.maximumY + 1 / rows
          ) {
            return false;
          }

          let subsamplesInside = 0;
          for (let subRow = 0; subRow < SUBSAMPLES_PER_AXIS; subRow++) {
            for (
              let subColumn = 0;
              subColumn < SUBSAMPLES_PER_AXIS;
              subColumn++
            ) {
              const subsampleX =
                (column + (subColumn + 0.5) / SUBSAMPLES_PER_AXIS) / columns;
              const subsampleY =
                (row + (subRow + 0.5) / SUBSAMPLES_PER_AXIS) / rows;
              if (isPointInPolygon(subsampleX, subsampleY, polygon)) {
                subsamplesInside++;
              }
            }
          }

          return subsamplesInside >= MINIMUM_SUBSAMPLES_INSIDE_FURNITURE;
        },
      );

      furnitureIndexByCell[row * columns + column] = furnitureIndex;
    }
  }

  return furnitureIndexByCell;
};

const restoreRoomLines = (
  roomLuminances: Float32Array,
  luminances: Float32Array,
  isFurnitureCell: Uint8Array,
  columns: number,
  rows: number,
) => {
  for (const {
    start,
    end,
    thickness,
  } of ONBOARDING_HOME_ILLUSTRATION_ROOM_LINES) {
    const [startX, startY] = start;
    const segmentX = end[0] - startX;
    const segmentY = end[1] - startY;
    const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
    const lineCells: { cellIndex: number; positionOnLine: number }[] = [];

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const cellCenterX = (column + 0.5) / columns;
        const cellCenterY = (row + 0.5) / rows;
        const positionOnLine = clampToUnitRange(
          ((cellCenterX - startX) * segmentX +
            (cellCenterY - startY) * segmentY) /
            segmentLengthSquared,
        );
        const distanceToLine = Math.hypot(
          cellCenterX - (startX + segmentX * positionOnLine),
          cellCenterY - (startY + segmentY * positionOnLine),
        );

        if (distanceToLine <= thickness / 2) {
          lineCells.push({ cellIndex: row * columns + column, positionOnLine });
        }
      }
    }

    const visibleLineCells = lineCells.filter(
      ({ cellIndex }) => isFurnitureCell[cellIndex] === 0,
    );
    if (visibleLineCells.length === 0) {
      continue;
    }

    for (const { cellIndex, positionOnLine } of lineCells) {
      if (isFurnitureCell[cellIndex] === 0) {
        continue;
      }

      const nearestVisibleLineCell = visibleLineCells.reduce(
        (nearest, candidate) =>
          Math.abs(candidate.positionOnLine - positionOnLine) <
          Math.abs(nearest.positionOnLine - positionOnLine)
            ? candidate
            : nearest,
      );

      roomLuminances[cellIndex] = Math.min(
        roomLuminances[cellIndex],
        luminances[nearestVisibleLineCell.cellIndex],
      );
    }
  }
};

const getInk = (
  luminance: number,
  normalizedX: number,
  normalizedY: number,
) => {
  const ink = clampToUnitRange(
    (WHITE_POINT_LUMINANCE - luminance) /
      (WHITE_POINT_LUMINANCE - BLACK_POINT_LUMINANCE),
  );
  const edgeFade =
    smoothStep(
      0,
      HORIZONTAL_EDGE_FADE_RATIO,
      Math.min(normalizedX, 1 - normalizedX),
    ) *
    smoothStep(0, TOP_EDGE_FADE_RATIO, normalizedY) *
    smoothStep(0, BOTTOM_EDGE_FADE_RATIO, 1 - normalizedY);

  return Math.min(MAXIMUM_INK, Math.pow(ink, INK_GAMMA)) * edgeFade;
};

type BuildOnboardingHomeIllustrationCellsArgs = {
  luminances: Float32Array;
  columns: number;
  rows: number;
  pitch: number;
  originX: number;
  originY: number;
};

export type OnboardingHomeIllustrationLayout = {
  cells: OnboardingHomeIllustrationCell[];
  pitch: number;
  centerX: number;
  centerY: number;
  size: number;
};

export const buildOnboardingHomeIllustrationCells = ({
  luminances,
  columns,
  rows,
  pitch,
  originX,
  originY,
}: BuildOnboardingHomeIllustrationCellsArgs): OnboardingHomeIllustrationLayout => {
  const furnitureIndexByCell = getFurnitureIndexByCell(columns, rows);
  const isFurnitureCell = Uint8Array.from(
    furnitureIndexByCell,
    (furnitureIndex) => (furnitureIndex === NO_FURNITURE ? 0 : 1),
  );

  const roomLuminances = fillOnboardingHomeIllustrationRoom({
    luminances,
    isFurnitureCell,
    columns,
    rows,
  });
  restoreRoomLines(roomLuminances, luminances, isFurnitureCell, columns, rows);

  const furnitureRowRanges = ONBOARDING_HOME_ILLUSTRATION_FURNITURE.map(() => ({
    firstRow: rows,
    lastRow: -1,
  }));
  furnitureIndexByCell.forEach((furnitureIndex, cellIndex) => {
    if (furnitureIndex === NO_FURNITURE) {
      return;
    }
    const row = Math.floor(cellIndex / columns);
    const rowRange = furnitureRowRanges[furnitureIndex];
    rowRange.firstRow = Math.min(rowRange.firstRow, row);
    rowRange.lastRow = Math.max(rowRange.lastRow, row);
  });

  const width = columns * pitch;
  const height = rows * pitch;
  const centerX = originX + width / 2;
  const centerY = originY + height / 2;
  const size = Math.max(width, height);
  const maximumDistanceToCenter = Math.hypot(width / 2, height / 2) || 1;

  const cells: OnboardingHomeIllustrationCell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const cellIndex = row * columns + column;
      const x = originX + (column + 0.5) * pitch;
      const y = originY + (row + 0.5) * pitch;
      const normalizedX = (column + 0.5) / columns;
      const normalizedY = (row + 0.5) / rows;
      const furnitureIndex = furnitureIndexByCell[cellIndex];
      const photoInk = getInk(luminances[cellIndex], normalizedX, normalizedY);

      let revealDelaySeconds = 0;
      if (furnitureIndex !== NO_FURNITURE) {
        const { firstRow, lastRow } = furnitureRowRanges[furnitureIndex];
        revealDelaySeconds =
          (REVEAL_SWEEP_SECONDS * (lastRow - row)) /
            Math.max(1, lastRow - firstRow) +
          REVEAL_JITTER_SECONDS * pseudoRandomFromSeed(cellIndex * 7.3);
      }

      const distanceToCenter = Math.hypot(x - centerX, y - centerY);
      const scatterAngle = pseudoRandomFromSeed(cellIndex * 1.3) * TAU;
      const scatterRadius =
        size *
        (FINALE_SCATTER_MINIMUM_RATIO +
          FINALE_SCATTER_RANGE_RATIO * pseudoRandomFromSeed(cellIndex * 2.1));
      const distanceToCenterRatio = distanceToCenter / maximumDistanceToCenter;

      cells.push({
        x,
        y,
        photoInk,
        roomInk:
          furnitureIndex === NO_FURNITURE
            ? photoInk
            : getInk(roomLuminances[cellIndex], normalizedX, normalizedY),
        furnitureIndex: furnitureIndex === NO_FURNITURE ? null : furnitureIndex,
        revealDelaySeconds,
        finaleDelaySeconds:
          FINALE_STAGGER_SECONDS * distanceToCenterRatio +
          FINALE_JITTER_SECONDS * pseudoRandomFromSeed(cellIndex * 3.7),
        scatterX: centerX + Math.cos(scatterAngle) * scatterRadius,
        scatterY: centerY + Math.sin(scatterAngle) * scatterRadius,
        burstDirectionX:
          distanceToCenter > 0 ? (x - centerX) / distanceToCenter : 0,
        burstDirectionY:
          distanceToCenter > 0 ? (y - centerY) / distanceToCenter : -1,
        distanceToCenterRatio,
        driftPhase: pseudoRandomFromSeed(cellIndex * 5.1) * TAU,
      });
    }
  }

  return { cells, pitch, centerX, centerY, size };
};
