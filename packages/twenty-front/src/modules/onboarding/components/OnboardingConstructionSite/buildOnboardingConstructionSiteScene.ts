import { isDefined } from 'twenty-shared/utils';

import { type OnboardingConstructionSiteConstruction } from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteConstruction.type';
import {
  type OnboardingConstructionSiteInstances,
  type OnboardingConstructionSiteMeshName,
} from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteInstances.type';
import {
  type OnboardingConstructionSiteVector,
  writeTransformMatrix,
} from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteMatrices';

export const ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX = 5;
export const ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE = 17;

const REVEAL_SWEEP = 0.8;
const WHEEL_RADIUS = 0.12;
const EDGE_MARGIN = 0.2;
const CONTENT_GAP = 0.25;
const SCENE_HEIGHT_TO_HALF_HEIGHT_RATIO = 1.2;
const MINIMUM_CLUSTER_SCALE = 0.5;
const MAXIMUM_CLUSTER_SCALE = 1.25;
const NO_ROTATION: OnboardingConstructionSiteVector = [0, 0, 0];

const ROUND_TOWER_CLUSTER_WIDTH = 3.0;
const ROUND_TOWER_CLUSTER_HEIGHT = 4.65;
const BRACED_TOWER_CLUSTER_WIDTH = 3.3;
const BRACED_TOWER_CLUSTER_HEIGHT = 3.5;

const SLAB_THICKNESS = 0.08;

const ROUND_TOWER_X = 1.85;
const ROUND_TOWER_Z = -0.45;
const ROUND_TOWER_FLOOR_HEIGHT = 0.34;
const ROUND_TOWER_GLASS_RADIUS = 0.6;
const ROUND_TOWER_SLAB_RADIUS = 0.68;
const ROUND_TOWER_COLUMN_RADIUS = 0.5;
const ROUND_TOWER_COLUMN_COUNT = 10;
const ROUND_TOWER_BUILT_FLOORS_BY_STAGE = [1, 3, 5, 7, 9, 10];
const ROUND_TOWER_CLAD_FLOORS_BY_STAGE = [0, 1, 3, 5, 7, 10];
const SMALL_ROUND_TOWER_BUILT_FLOORS_BY_STAGE = [0, 0, 2, 3, 3, 4];

const BRACED_TOWER_X = 1.95;
const BRACED_TOWER_Z = -0.6;
const BRACED_TOWER_FLOOR_COUNT = 14;
const BRACED_TOWER_FLOOR_HEIGHT = 0.3;
const BRACED_TOWER_WIDTH = 1.1;
const BRACED_TOWER_BUILT_FLOORS_BY_STAGE = [0, 0, 4, 7, 10, 14];

const MIXER_TRUCK_EXIT_PROGRESS_BY_STAGE = [0, 1, 1, 1, 1, 1];
const MIXER_TRUCK_TURN_START_PROGRESS = 0.1;
const MIXER_TRUCK_TURN_END_PROGRESS = 0.55;
const MIXER_TRUCK_TURN_RADIUS = 0.4;

const EDGE_BUILDING_BAY_COUNT = 4;
const EDGE_BUILDING_BAY_WIDTH = 0.55;
const EDGE_BUILDING_FLOOR_HEIGHT = 0.34;
const EDGE_BUILDING_FRONT_Z = -0.2;
const EDGE_BUILDING_BACK_Z = -1.0;
const EDGE_BUILDING_COLUMN_WIDTH = 0.1;
const EDGE_BUILDING_VISIBLE_WIDTH = 0.8;
const EDGE_BUILDING_BUILT_FLOORS_BY_STAGE = [0, 0, 4, 5, 7, 11];
const EDGE_BUILDING_FRAMED_FLOORS_BY_STAGE = [0, 0, 1, 2, 3, 4];
const LEFT_EDGE_TOWER_VISIBLE_WIDTH = 0.5;
const LEFT_EDGE_TOWER_BUILT_FLOORS_BY_STAGE = [3, 6, 9, 13, 17, 20];
const LEFT_EDGE_TOWER_FRAMED_FLOORS_BY_STAGE = [0, 2, 4, 7, 11, 15];

const ALBEDO = {
  slab: 1,
  column: 0.85,
  core: 0.72,
  rebar: 0.75,
  glass: 0.7,
  finishedGlass: 0.92,
  crane: 1,
  counterweight: 0.6,
  cabin: 0.82,
  cabinWindow: 0.25,
  truck: 0.85,
  drum: 0.95,
  tire: 0.9,
  hub: 0.2,
  load: 0.8,
  machine: 0.82,
  glazingFrame: 0.9,
  brace: 0.95,
  recess: 0.22,
} as const;

const clampToUnitRange = (value: number) => Math.max(0, Math.min(1, value));
const smootherStep = (ratio: number) =>
  ratio * ratio * ratio * (ratio * (ratio * 6 - 15) + 10);

const getRevealStage = (stageCounts: readonly number[], index: number) => {
  const stageIndex = stageCounts.findIndex((count) => count > index);
  return stageIndex === -1
    ? ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX
    : stageIndex;
};

export type OnboardingConstructionSiteLayout = {
  halfWidth: number;
  halfHeight: number;
  contentHalfWidth: number;
  groundY: number;
};

type BuildOnboardingConstructionSiteSceneArgs = {
  instances: OnboardingConstructionSiteInstances;
  layout: OnboardingConstructionSiteLayout;
  construction: OnboardingConstructionSiteConstruction;
  truckConstruction?: OnboardingConstructionSiteConstruction;
  craneMotion: number;
};

export const buildOnboardingConstructionSiteScene = ({
  instances,
  layout,
  construction,
  truckConstruction = construction,
  craneMotion,
}: BuildOnboardingConstructionSiteSceneArgs) => {
  instances.cube.count = 0;
  instances.cylinder.count = 0;
  instances.cone.count = 0;
  instances.mixerDrum.count = 0;

  const { halfWidth, halfHeight, contentHalfWidth, groundY } = layout;
  const sceneHeight = halfHeight * SCENE_HEIGHT_TO_HALF_HEIGHT_RATIO;

  const addInstance = (
    meshName: OnboardingConstructionSiteMeshName,
    position: OnboardingConstructionSiteVector,
    rotation: OnboardingConstructionSiteVector,
    scale: OnboardingConstructionSiteVector,
    albedo: number,
  ) => {
    const batch = instances[meshName];
    const offset =
      batch.count * ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE;
    if (
      offset + ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE >
        batch.data.length ||
      scale[0] <= 0 ||
      scale[1] <= 0 ||
      scale[2] <= 0
    ) {
      return;
    }
    writeTransformMatrix(batch.data, offset, position, rotation, scale);
    batch.data[offset + 16] = albedo;
    batch.count++;
  };

  const getAppearance = (revealStageIndex: number, worldY: number) => {
    if (revealStageIndex <= construction.builtStageIndex) {
      return 1;
    }
    const growth =
      construction.growingStageGrowths[
        revealStageIndex - construction.builtStageIndex - 1
      ];
    if (!isDefined(growth)) {
      return 0;
    }

    const heightRatio = clampToUnitRange((worldY - groundY) / sceneHeight);
    return smootherStep(
      clampToUnitRange(
        growth * (1 + REVEAL_SWEEP) - heightRatio * REVEAL_SWEEP,
      ),
    );
  };

  const stagePosition =
    truckConstruction.builtStageIndex +
    truckConstruction.growingStageGrowths.reduce(
      (total, growth) => total + growth,
      0,
    );
  const getStageValue = (valuesByStage: readonly number[]) => {
    const position = Math.max(
      0,
      Math.min(valuesByStage.length - 1, stagePosition),
    );
    const lowerStageIndex = Math.floor(position);
    const upperStageIndex = Math.min(
      lowerStageIndex + 1,
      valuesByStage.length - 1,
    );
    return (
      valuesByStage[lowerStageIndex] +
      (valuesByStage[upperStageIndex] - valuesByStage[lowerStageIndex]) *
        (position - lowerStageIndex)
    );
  };

  const createFrame = (
    originX: number,
    originZ: number,
    scale: number,
    yaw = 0,
  ) => {
    const cosineYaw = Math.cos(yaw);
    const sineYaw = Math.sin(yaw);
    const toWorld = (
      localPosition: OnboardingConstructionSiteVector,
    ): OnboardingConstructionSiteVector => [
      originX +
        (localPosition[0] * cosineYaw + localPosition[2] * sineYaw) * scale,
      groundY + localPosition[1] * scale,
      originZ +
        (-localPosition[0] * sineYaw + localPosition[2] * cosineYaw) * scale,
    ];
    const toWorldRotation = (
      rotation: OnboardingConstructionSiteVector,
    ): OnboardingConstructionSiteVector => [
      rotation[0],
      rotation[1] + yaw,
      rotation[2],
    ];
    const toWorldScale = (
      localScale: OnboardingConstructionSiteVector,
    ): OnboardingConstructionSiteVector => [
      localScale[0] * scale,
      localScale[1] * scale,
      localScale[2] * scale,
    ];

    return {
      scale,
      worldX: (localX: number) => originX + localX * scale,
      worldY: (localY: number) => groundY + localY * scale,
      worldZ: (localZ: number) => originZ + localZ * scale,
      box: (
        localPosition: OnboardingConstructionSiteVector,
        localScale: OnboardingConstructionSiteVector,
        albedo: number,
        rotation: OnboardingConstructionSiteVector = NO_ROTATION,
      ) =>
        addInstance(
          'cube',
          toWorld(localPosition),
          toWorldRotation(rotation),
          toWorldScale(localScale),
          albedo,
        ),
      round: (
        meshName: Exclude<OnboardingConstructionSiteMeshName, 'cube'>,
        localPosition: OnboardingConstructionSiteVector,
        localScale: OnboardingConstructionSiteVector,
        albedo: number,
        rotation: OnboardingConstructionSiteVector = NO_ROTATION,
      ) =>
        addInstance(
          meshName,
          toWorld(localPosition),
          toWorldRotation(rotation),
          toWorldScale(localScale),
          albedo,
        ),
    };
  };

  type Frame = ReturnType<typeof createFrame>;

  const getGlassAlbedo = (worldY: number) =>
    ALBEDO.glass +
    (ALBEDO.finishedGlass - ALBEDO.glass) *
      getAppearance(ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX, worldY);

  const addBeam = (
    { box }: Frame,
    start: OnboardingConstructionSiteVector,
    end: OnboardingConstructionSiteVector,
    thickness: number,
    albedo: number,
  ) => {
    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];
    const deltaZ = end[2] - start[2];
    const horizontalLength = Math.hypot(deltaX, deltaZ);
    box(
      [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2,
      ],
      [Math.hypot(horizontalLength, deltaY), thickness, thickness],
      albedo,
      [0, Math.atan2(-deltaZ, deltaX), Math.atan2(deltaY, horizontalLength)],
    );
  };

  const addWheel = ({ round }: Frame, wheelX: number, wheelZ: number) => {
    const side = Math.sign(wheelZ);
    round(
      'cylinder',
      [wheelX, WHEEL_RADIUS, wheelZ],
      [WHEEL_RADIUS * 2, 0.1, WHEEL_RADIUS * 2],
      ALBEDO.tire,
      [Math.PI / 2, 0, 0],
    );
    round(
      'cylinder',
      [wheelX, WHEEL_RADIUS, wheelZ + side * 0.055],
      [WHEEL_RADIUS * 1.25, 0.025, WHEEL_RADIUS * 1.25],
      ALBEDO.hub,
      [Math.PI / 2, 0, 0],
    );
    round(
      'cylinder',
      [wheelX, WHEEL_RADIUS, wheelZ + side * 0.075],
      [WHEEL_RADIUS * 0.5, 0.025, WHEEL_RADIUS * 0.5],
      ALBEDO.slab,
      [Math.PI / 2, 0, 0],
    );
  };

  const addTruckCab = ({ box }: Frame) => {
    box([0.43, 0.32, 0], [0.3, 0.2, 0.4], ALBEDO.truck);
    box([0.41, 0.47, 0], [0.26, 0.18, 0.38], ALBEDO.truck);
    box([0.41, 0.565, 0], [0.3, 0.04, 0.43], ALBEDO.slab);
    for (const side of [-1, 1]) {
      box([0.42, 0.48, side * 0.196], [0.19, 0.12, 0.025], ALBEDO.cabinWindow);
      box([0.36, 0.27, side * 0.225], [0.21, 0.045, 0.09], ALBEDO.slab);
      box([0.56, 0.37, side * 0.21], [0.06, 0.06, 0.035], ALBEDO.slab);
      box([0.5, 0.48, side * 0.27], [0.055, 0.075, 0.065], ALBEDO.machine);
    }
    box([0.55, 0.48, 0], [0.025, 0.12, 0.3], ALBEDO.cabinWindow);
    box([0.59, 0.31, 0], [0.025, 0.09, 0.26], ALBEDO.recess);
    box([0.6, 0.23, 0], [0.06, 0.06, 0.44], ALBEDO.slab);
  };

  const buildMixerTruck = (frame: Frame) => {
    const { box, round } = frame;
    box([0, 0.18, 0], [1.1, 0.1, 0.34], ALBEDO.recess);
    addTruckCab(frame);
    box([-0.18, 0.29, 0], [0.68, 0.1, 0.3], ALBEDO.truck);
    round('mixerDrum', [-0.14, 0.49, 0], [0.5, 0.72, 0.5], ALBEDO.drum, [
      0,
      0,
      -Math.PI / 2 + 0.28,
    ]);
    for (const side of [-1, 1]) {
      box([-0.26, 0.265, side * 0.22], [0.58, 0.055, 0.09], ALBEDO.slab);
      box([0.08, 0.2, side * 0.2], [0.16, 0.13, 0.09], ALBEDO.machine);
      for (const wheelX of [0.36, -0.12, -0.36]) {
        addWheel(frame, wheelX, side * 0.2);
      }
    }
    box([-0.52, 0.4, 0], [0.16, 0.13, 0.23], ALBEDO.machine);
    addBeam(frame, [-0.48, 0.37, 0.08], [-0.69, 0.24, 0.15], 0.08, ALBEDO.slab);
  };

  type TowerCraneOptions = {
    mastX: number;
    mastZ: number;
    mastHeight: number;
    loadTarget: OnboardingConstructionSiteVector;
    jibLength: number;
    counterJibLength: number;
    hasOpenMast?: boolean;
  };

  const addTowerCrane = (
    frame: Frame,
    {
      mastX,
      mastZ,
      mastHeight,
      loadTarget,
      jibLength,
      counterJibLength,
      hasOpenMast = false,
    }: TowerCraneOptions,
  ) => {
    const { box } = frame;
    if (mastHeight <= 0.001) {
      return;
    }
    const beamWidth = Math.max(0.1, 0.09 / frame.scale);
    const braceWidth = Math.max(0.06, 0.055 / frame.scale);
    const cableWidth = Math.max(0.075, 0.065 / frame.scale);
    const jibBeamWidth = beamWidth * 1.2;
    const jibBraceWidth = braceWidth * 1.1;
    const jibHeight = 0.42;
    const mastHalfWidth = hasOpenMast ? 0.23 : 0.17;
    const mastHalfDepth = hasOpenMast ? 0.11 : 0.17;
    const mastBeamWidth = beamWidth * (hasOpenMast ? 0.65 : 1);
    const mastBraceWidth = braceWidth * (hasOpenMast ? 0.7 : 1);

    box([mastX, 0.06, mastZ], [0.5, 0.12, 0.5], ALBEDO.counterweight);
    for (const sideX of [-1, 1]) {
      for (const sideZ of [-1, 1]) {
        box(
          [
            mastX + sideX * mastHalfWidth,
            mastHeight / 2,
            mastZ + sideZ * mastHalfDepth,
          ],
          [mastBeamWidth, mastHeight, mastBeamWidth],
          ALBEDO.crane,
        );
      }
    }
    const mastBayCount = Math.ceil(mastHeight / (hasOpenMast ? 0.78 : 0.52));
    for (let bayIndex = 0; bayIndex < mastBayCount; bayIndex++) {
      const bottomY = (bayIndex / mastBayCount) * mastHeight;
      const topY = ((bayIndex + 1) / mastBayCount) * mastHeight;
      for (const sideZ of [-1, 1]) {
        box(
          [mastX, topY, mastZ + sideZ * mastHalfDepth],
          [mastHalfWidth * 2 + mastBeamWidth, mastBraceWidth, mastBraceWidth],
          ALBEDO.crane,
        );
        const diagonalDirection = bayIndex % 2 === 0 ? 1 : -1;
        addBeam(
          frame,
          [
            mastX - diagonalDirection * mastHalfWidth,
            bottomY,
            mastZ + sideZ * mastHalfDepth,
          ],
          [
            mastX + diagonalDirection * mastHalfWidth,
            topY,
            mastZ + sideZ * mastHalfDepth,
          ],
          mastBraceWidth,
          ALBEDO.brace,
        );
      }
    }

    const targetDeltaX = loadTarget[0] - mastX;
    const targetDeltaZ = loadTarget[2] - mastZ;
    const yaw = Math.atan2(-targetDeltaZ, targetDeltaX);
    const directionX = Math.cos(yaw);
    const directionZ = -Math.sin(yaw);
    const jibPoint = (
      distance: number,
      height: number,
    ): OnboardingConstructionSiteVector => [
      mastX + directionX * distance,
      mastHeight + height,
      mastZ + directionZ * distance,
    ];

    for (const height of [0, jibHeight]) {
      addBeam(
        frame,
        jibPoint(-counterJibLength, height),
        jibPoint(jibLength, height),
        jibBeamWidth,
        ALBEDO.crane,
      );
    }
    const jibBayCount = Math.ceil((jibLength + counterJibLength) / 0.42);
    for (let bayIndex = 0; bayIndex < jibBayCount; bayIndex++) {
      const start =
        -counterJibLength +
        ((jibLength + counterJibLength) * bayIndex) / jibBayCount;
      const end =
        -counterJibLength +
        ((jibLength + counterJibLength) * (bayIndex + 1)) / jibBayCount;
      addBeam(
        frame,
        jibPoint(start, 0),
        jibPoint(start, jibHeight),
        jibBraceWidth,
        ALBEDO.crane,
      );
      addBeam(
        frame,
        jibPoint(start, bayIndex % 2 === 0 ? 0 : jibHeight),
        jibPoint(end, bayIndex % 2 === 0 ? jibHeight : 0),
        jibBraceWidth,
        ALBEDO.brace,
      );
    }
    addBeam(
      frame,
      jibPoint(jibLength, 0),
      jibPoint(jibLength, jibHeight),
      jibBeamWidth,
      ALBEDO.crane,
    );
    box(
      [mastX, mastHeight + 0.42, mastZ],
      [beamWidth, 0.7, beamWidth],
      ALBEDO.crane,
    );
    addBeam(
      frame,
      jibPoint(0, 0.76),
      jibPoint(jibLength * 0.6, jibHeight),
      jibBeamWidth,
      ALBEDO.crane,
    );
    addBeam(
      frame,
      jibPoint(0, 0.76),
      jibPoint(-counterJibLength + 0.1, jibHeight),
      jibBeamWidth,
      ALBEDO.crane,
    );
    box(
      jibPoint(-counterJibLength + 0.24, -0.1),
      [0.4, 0.32, 0.3],
      ALBEDO.counterweight,
      [0, yaw, 0],
    );
    box(jibPoint(0.2, -0.12), [0.26, 0.24, 0.24], ALBEDO.cabin, [0, yaw, 0]);
    const cabinWindow = jibPoint(0.2, -0.1);
    box(
      [
        cabinWindow[0] + Math.sin(yaw) * 0.13,
        cabinWindow[1],
        cabinWindow[2] + Math.cos(yaw) * 0.13,
      ],
      [0.18, 0.12, 0.025],
      ALBEDO.cabinWindow,
      [0, yaw, 0],
    );

    const trolleyDistance = Math.hypot(targetDeltaX, targetDeltaZ);
    const loadY = loadTarget[1] + 0.06 + 0.65 * (1 - craneMotion);
    const cableLength = Math.max(0.08, mastHeight - 0.14 - loadY);
    const [hookX, , hookZ] = jibPoint(trolleyDistance, 0);
    box([hookX, mastHeight - 0.04, hookZ], [0.2, 0.08, 0.16], ALBEDO.crane, [
      0,
      yaw,
      0,
    ]);
    box(
      [hookX, mastHeight - 0.08 - cableLength / 2, hookZ],
      [cableWidth, cableLength, cableWidth],
      ALBEDO.crane,
    );
    const hookY = mastHeight - 0.08 - cableLength;
    box([hookX, hookY, hookZ], [0.1, 0.12, 0.1], ALBEDO.machine);
    const workProgress = construction.growingStageGrowths.at(-1) ?? 1;
    const loadVisibility =
      workProgress > 0
        ? smootherStep(clampToUnitRange((0.5 - workProgress) / 0.04))
        : 0;
    if (loadVisibility > 0) {
      box(
        [hookX, hookY - 0.06, hookZ],
        [0.45, 0.12 * loadVisibility, 0.18],
        ALBEDO.load,
        [0, yaw, 0],
      );
    }
  };

  const addRoundTower = (
    frame: Frame,
    {
      builtFloorsByStage = ROUND_TOWER_BUILT_FLOORS_BY_STAGE,
      cladFloorsByStage = ROUND_TOWER_CLAD_FLOORS_BY_STAGE,
      hasCrane = true,
    }: {
      builtFloorsByStage?: readonly number[];
      cladFloorsByStage?: readonly number[];
      hasCrane?: boolean;
    } = {},
  ) => {
    const { box, round, worldY } = frame;
    const floorCount = builtFloorsByStage[builtFloorsByStage.length - 1];
    let builtHeight = 0;

    for (let floorIndex = 0; floorIndex < floorCount; floorIndex++) {
      const baseY = floorIndex * ROUND_TOWER_FLOOR_HEIGHT;
      const rise = getAppearance(
        getRevealStage(builtFloorsByStage, floorIndex),
        worldY(baseY),
      );
      if (rise <= 0.001) {
        break;
      }
      const riseHeight = ROUND_TOWER_FLOOR_HEIGHT * rise;
      builtHeight = baseY + riseHeight;
      const columnHeight = Math.max(0, riseHeight - SLAB_THICKNESS);
      for (
        let columnIndex = 0;
        columnIndex < ROUND_TOWER_COLUMN_COUNT;
        columnIndex++
      ) {
        const angle = (columnIndex / ROUND_TOWER_COLUMN_COUNT) * Math.PI * 2;
        round(
          'cylinder',
          [
            ROUND_TOWER_X + Math.cos(angle) * ROUND_TOWER_COLUMN_RADIUS,
            baseY + columnHeight / 2,
            ROUND_TOWER_Z + Math.sin(angle) * ROUND_TOWER_COLUMN_RADIUS,
          ],
          [0.13, columnHeight, 0.13],
          ALBEDO.column,
        );
      }
      round(
        'cylinder',
        [ROUND_TOWER_X, baseY + riseHeight - SLAB_THICKNESS / 2, ROUND_TOWER_Z],
        [
          ROUND_TOWER_SLAB_RADIUS * 2,
          SLAB_THICKNESS,
          ROUND_TOWER_SLAB_RADIUS * 2,
        ],
        ALBEDO.slab,
      );

      const cladding = getAppearance(
        getRevealStage(cladFloorsByStage, floorIndex),
        worldY(baseY),
      );
      const glassHeight = columnHeight * cladding;
      if (glassHeight > 0.001) {
        round(
          'cylinder',
          [ROUND_TOWER_X, baseY + glassHeight / 2, ROUND_TOWER_Z],
          [
            ROUND_TOWER_GLASS_RADIUS * 2,
            glassHeight,
            ROUND_TOWER_GLASS_RADIUS * 2,
          ],
          getGlassAlbedo(worldY(baseY)),
        );
        for (
          let mullionIndex = 0;
          mullionIndex < ROUND_TOWER_COLUMN_COUNT;
          mullionIndex++
        ) {
          const angle =
            Math.PI / 2 -
            (mullionIndex / ROUND_TOWER_COLUMN_COUNT) * Math.PI * 2;
          box(
            [
              ROUND_TOWER_X + Math.sin(angle) * ROUND_TOWER_GLASS_RADIUS,
              baseY + glassHeight / 2,
              ROUND_TOWER_Z + Math.cos(angle) * ROUND_TOWER_GLASS_RADIUS,
            ],
            [0.055, glassHeight, 0.045],
            ALBEDO.recess,
            [0, angle, 0],
          );
        }
        round(
          'cylinder',
          [ROUND_TOWER_X, baseY + glassHeight - 0.02 * cladding, ROUND_TOWER_Z],
          [
            ROUND_TOWER_GLASS_RADIUS * 2 + 0.025,
            0.04 * cladding,
            ROUND_TOWER_GLASS_RADIUS * 2 + 0.025,
          ],
          ALBEDO.recess,
        );
      }
    }

    const towerTopY = floorCount * ROUND_TOWER_FLOOR_HEIGHT;
    const crown = getAppearance(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
      worldY(towerTopY),
    );
    if (crown > 0.001) {
      round(
        'cylinder',
        [ROUND_TOWER_X, towerTopY + 0.17 * crown, ROUND_TOWER_Z],
        [0.9, 0.34 * crown, 0.9],
        ALBEDO.finishedGlass,
      );
      round(
        'cylinder',
        [ROUND_TOWER_X, towerTopY + 0.34 * crown + 0.04, ROUND_TOWER_Z],
        [1.02, 0.08, 1.02],
        ALBEDO.slab,
      );
      for (let finIndex = 0; finIndex < ROUND_TOWER_COLUMN_COUNT; finIndex++) {
        const angle =
          Math.PI / 2 - (finIndex / ROUND_TOWER_COLUMN_COUNT) * Math.PI * 2;
        box(
          [
            ROUND_TOWER_X + Math.sin(angle) * 0.45,
            towerTopY + 0.17 * crown,
            ROUND_TOWER_Z + Math.cos(angle) * 0.45,
          ],
          [0.055, 0.34 * crown, 0.06],
          ALBEDO.recess,
          [0, angle, 0],
        );
      }
      round(
        'cylinder',
        [ROUND_TOWER_X, towerTopY + 0.42 + 0.07 * crown, ROUND_TOWER_Z],
        [0.3, 0.14 * crown, 0.3],
        ALBEDO.core,
      );
      round(
        'cone',
        [ROUND_TOWER_X, towerTopY + 0.42 + 0.4 * crown, ROUND_TOWER_Z],
        [0.16, 0.8 * crown, 0.16],
        ALBEDO.crane,
      );
    }

    if (!hasCrane) {
      return;
    }

    const craneRise = getAppearance(0, worldY(0));
    const workHeight = builtHeight + 0.42 * crown;
    addTowerCrane(frame, {
      mastX: 0.45,
      mastZ: -1.1,
      mastHeight: Math.max(2.4, workHeight + 1) * craneRise,
      loadTarget: [ROUND_TOWER_X - 0.32, workHeight, ROUND_TOWER_Z - 0.18],
      jibLength: 2.3,
      counterJibLength: 0.75,
      hasOpenMast: true,
    });
  };

  const addSmallRoundTower = (frame: Frame) => {
    const { round, worldY } = frame;
    const floorHeight = 0.36;
    for (let floorIndex = 0; floorIndex < 4; floorIndex++) {
      const baseY = floorIndex * floorHeight;
      const rise = getAppearance(
        getRevealStage(SMALL_ROUND_TOWER_BUILT_FLOORS_BY_STAGE, floorIndex),
        worldY(baseY),
      );
      if (rise <= 0.001) {
        break;
      }
      const radius = 0.45 - floorIndex * 0.025;
      const height = floorHeight * rise;
      for (let columnIndex = 0; columnIndex < 8; columnIndex++) {
        const angle = (columnIndex * Math.PI) / 4;
        round(
          'cylinder',
          [
            Math.cos(angle) * (radius - 0.06),
            baseY + height / 2,
            Math.sin(angle) * (radius - 0.06),
          ],
          [0.065, height, 0.065],
          ALBEDO.column,
        );
      }
      round(
        'cylinder',
        [0, baseY + height - 0.03, 0],
        [radius * 2 + 0.2, 0.06, radius * 2 + 0.2],
        ALBEDO.slab,
      );
    }
  };

  const addBracedTower = (frame: Frame) => {
    const { box, round, worldY } = frame;
    const towerHeight = BRACED_TOWER_FLOOR_COUNT * BRACED_TOWER_FLOOR_HEIGHT;
    const halfWidthAtHeight = (height: number) =>
      BRACED_TOWER_WIDTH / 2 - 0.3 * clampToUnitRange(height / towerHeight);
    const cornerAtHeight = (
      sideX: number,
      sideZ: number,
      height: number,
    ): OnboardingConstructionSiteVector => [
      BRACED_TOWER_X + sideX * halfWidthAtHeight(height),
      height,
      BRACED_TOWER_Z + sideZ * halfWidthAtHeight(height),
    ];
    let builtHeight = 0;

    for (
      let floorIndex = 0;
      floorIndex < BRACED_TOWER_FLOOR_COUNT;
      floorIndex++
    ) {
      const baseY = floorIndex * BRACED_TOWER_FLOOR_HEIGHT;
      const rise = getAppearance(
        getRevealStage(BRACED_TOWER_BUILT_FLOORS_BY_STAGE, floorIndex),
        worldY(baseY),
      );
      if (rise <= 0.001) {
        break;
      }
      const topY = baseY + BRACED_TOWER_FLOOR_HEIGHT * rise;
      builtHeight = topY;
      for (const sideX of [-1, 1]) {
        for (const sideZ of [-1, 1]) {
          addBeam(
            frame,
            cornerAtHeight(sideX, sideZ, baseY),
            cornerAtHeight(sideX, sideZ, topY),
            0.08,
            ALBEDO.column,
          );
        }
      }
      const floorWidth = halfWidthAtHeight(topY) * 2;
      box(
        [BRACED_TOWER_X, topY - 0.014, BRACED_TOWER_Z],
        [floorWidth, 0.028, floorWidth],
        ALBEDO.slab,
      );
      for (const side of [-1, 1]) {
        box(
          [
            BRACED_TOWER_X,
            topY - 0.04,
            BRACED_TOWER_Z + (side * floorWidth) / 2,
          ],
          [floorWidth + 0.035, 0.07, 0.035],
          ALBEDO.slab,
        );
        box(
          [
            BRACED_TOWER_X + (side * floorWidth) / 2,
            topY - 0.04,
            BRACED_TOWER_Z,
          ],
          [0.035, 0.07, floorWidth + 0.035],
          ALBEDO.slab,
        );
        box(
          [
            BRACED_TOWER_X,
            topY - 0.065,
            BRACED_TOWER_Z + side * floorWidth * 0.2,
          ],
          [floorWidth - 0.06, 0.04, 0.035],
          ALBEDO.column,
        );
      }
    }

    for (
      let floorIndex = 0;
      floorIndex < BRACED_TOWER_FLOOR_COUNT;
      floorIndex += 4
    ) {
      const baseY = floorIndex * BRACED_TOWER_FLOOR_HEIGHT;
      const topY = Math.min(baseY + 4 * BRACED_TOWER_FLOOR_HEIGHT, builtHeight);
      if (topY <= baseY + 0.001) {
        break;
      }
      const direction = (floorIndex / 4) % 2 === 0 ? 1 : -1;
      for (const side of [-1, 1]) {
        addBeam(
          frame,
          cornerAtHeight(-direction, side, baseY),
          cornerAtHeight(direction, side, topY),
          0.09,
          ALBEDO.slab,
        );
        addBeam(
          frame,
          cornerAtHeight(side, direction, baseY),
          cornerAtHeight(side, -direction, topY),
          0.09,
          ALBEDO.slab,
        );
      }
      for (const sideX of [-1, 1]) {
        for (const sideZ of [-1, 1]) {
          const corner = cornerAtHeight(sideX, sideZ, topY);
          box(
            [corner[0], topY - 0.02, corner[2] + sideZ * 0.045],
            [0.14, 0.13, 0.035],
            ALBEDO.column,
          );
          for (const boltOffset of [-0.03, 0.03]) {
            round(
              'cylinder',
              [corner[0], topY - 0.02 + boltOffset, corner[2] + sideZ * 0.068],
              [0.03, 0.018, 0.03],
              ALBEDO.recess,
              [Math.PI / 2, 0, 0],
            );
          }
        }
      }
    }

    const crown = getAppearance(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
      worldY(towerHeight),
    );
    if (crown > 0.001) {
      const peak: OnboardingConstructionSiteVector = [
        BRACED_TOWER_X,
        towerHeight + 0.48 * crown,
        BRACED_TOWER_Z,
      ];
      for (const sideX of [-1, 1]) {
        for (const sideZ of [-1, 1]) {
          const corner = cornerAtHeight(sideX, sideZ, towerHeight);
          addBeam(frame, corner, peak, 0.07, ALBEDO.slab);
          box(
            [corner[0], towerHeight + 0.09 * crown, corner[2]],
            [0.035, 0.18 * crown, 0.035],
            ALBEDO.rebar,
          );
        }
      }
      const crownTieHeight = towerHeight + 0.22 * crown;
      for (const side of [-1, 1]) {
        box(
          [BRACED_TOWER_X + side * 0.135, crownTieHeight, BRACED_TOWER_Z],
          [0.035, 0.035, 0.27],
          ALBEDO.slab,
        );
        box(
          [BRACED_TOWER_X, crownTieHeight, BRACED_TOWER_Z + side * 0.135],
          [0.27, 0.035, 0.035],
          ALBEDO.slab,
        );
      }
      box(
        [peak[0], peak[1] + 0.05 * crown, peak[2]],
        [0.045, 0.14 * crown, 0.045],
        ALBEDO.rebar,
      );
    }
    return builtHeight;
  };

  const addBracedTowerCluster = (frame: Frame) => {
    const workHeight = addBracedTower(frame);
    const craneFrame = createFrame(
      halfWidth - 0.35 * frame.scale,
      0.35 * frame.scale,
      frame.scale * 0.75,
    );
    const loadTarget: OnboardingConstructionSiteVector = [
      (frame.worldX(BRACED_TOWER_X + 0.15) - craneFrame.worldX(0)) /
        craneFrame.scale,
      (workHeight * frame.scale) / craneFrame.scale,
      (frame.worldZ(BRACED_TOWER_Z + 0.12) - craneFrame.worldZ(0)) /
        craneFrame.scale,
    ];
    addTowerCrane(craneFrame, {
      mastX: 0,
      mastZ: 0,
      mastHeight:
        Math.max(2.4, loadTarget[1] + 1) *
        getAppearance(1, craneFrame.worldY(0)),
      loadTarget,
      jibLength: Math.max(2.3, Math.hypot(loadTarget[0], loadTarget[2]) + 0.3),
      counterJibLength: 0.75,
      hasOpenMast: true,
    });
    const turnStartX = frame.worldX(0.05);
    const endX = halfWidth + 1.2 * frame.scale;
    const exitProgress = getStageValue(MIXER_TRUCK_EXIT_PROGRESS_BY_STAGE);
    const approachProgress = smootherStep(
      clampToUnitRange(exitProgress / MIXER_TRUCK_TURN_START_PROGRESS),
    );
    const parkingOffset = 0.4 * frame.scale * (1 - approachProgress);
    const turnProgress = smootherStep(
      clampToUnitRange(
        (exitProgress - MIXER_TRUCK_TURN_START_PROGRESS) /
          (MIXER_TRUCK_TURN_END_PROGRESS - MIXER_TRUCK_TURN_START_PROGRESS),
      ),
    );
    const driveProgress = Math.pow(
      clampToUnitRange(
        (exitProgress - MIXER_TRUCK_TURN_END_PROGRESS) /
          (1 - MIXER_TRUCK_TURN_END_PROGRESS),
      ),
      2,
    );
    const turnAngle = Math.PI * turnProgress;
    const turnRadius = MIXER_TRUCK_TURN_RADIUS * frame.scale;
    buildMixerTruck(
      createFrame(
        turnStartX +
          parkingOffset -
          Math.sin(turnAngle) * turnRadius +
          (endX - turnStartX) * driveProgress,
        frame.worldZ(0.75) + (1 - Math.cos(turnAngle)) * turnRadius,
        frame.scale,
        Math.PI + turnAngle,
      ),
    );
  };

  const addEdgeBuilding = (
    frame: Frame,
    {
      builtFloorsByStage = EDGE_BUILDING_BUILT_FLOORS_BY_STAGE,
      framedFloorsByStage = EDGE_BUILDING_FRAMED_FLOORS_BY_STAGE,
      hasDiagonalBraces = false,
    }: {
      builtFloorsByStage?: readonly number[];
      framedFloorsByStage?: readonly number[];
      hasDiagonalBraces?: boolean;
    } = {},
  ) => {
    const { box, worldY } = frame;
    const floorCount = builtFloorsByStage[builtFloorsByStage.length - 1];
    const framedFloorCount =
      framedFloorsByStage[framedFloorsByStage.length - 1];
    const buildingWidth = EDGE_BUILDING_BAY_COUNT * EDGE_BUILDING_BAY_WIDTH;
    const buildingDepth = EDGE_BUILDING_FRONT_Z - EDGE_BUILDING_BACK_Z;
    const centerZ = (EDGE_BUILDING_FRONT_Z + EDGE_BUILDING_BACK_Z) / 2;
    let builtFloors = 0;
    let builtHeight = 0;

    for (let floorIndex = 0; floorIndex < floorCount; floorIndex++) {
      const baseY = floorIndex * EDGE_BUILDING_FLOOR_HEIGHT;
      const rise = getAppearance(
        getRevealStage(builtFloorsByStage, floorIndex),
        worldY(baseY),
      );
      if (rise <= 0.001) {
        break;
      }
      builtFloors += rise;

      const riseHeight = EDGE_BUILDING_FLOOR_HEIGHT * rise;
      builtHeight = baseY + riseHeight;
      const slabThickness =
        hasDiagonalBraces && floorIndex % 2 === 0 ? 0.04 : SLAB_THICKNESS;
      const columnHeight = Math.max(0, riseHeight - slabThickness);
      for (
        let lineIndex = 0;
        lineIndex <= EDGE_BUILDING_BAY_COUNT;
        lineIndex++
      ) {
        for (const columnZ of [EDGE_BUILDING_FRONT_Z, EDGE_BUILDING_BACK_Z]) {
          box(
            [
              lineIndex * EDGE_BUILDING_BAY_WIDTH,
              baseY + columnHeight / 2,
              columnZ,
            ],
            [
              EDGE_BUILDING_COLUMN_WIDTH,
              columnHeight,
              EDGE_BUILDING_COLUMN_WIDTH,
            ],
            ALBEDO.column,
          );
        }
      }
      box(
        [buildingWidth / 2, baseY + riseHeight - slabThickness / 2, centerZ],
        [buildingWidth + 0.1, slabThickness, buildingDepth + 0.1],
        ALBEDO.slab,
      );

      if (hasDiagonalBraces || floorIndex >= framedFloorCount) {
        continue;
      }
      const frameHeight =
        columnHeight *
        getAppearance(
          getRevealStage(framedFloorsByStage, floorIndex),
          worldY(baseY),
        );
      if (frameHeight <= 0.001) {
        continue;
      }
      for (let bayIndex = 0; bayIndex < EDGE_BUILDING_BAY_COUNT; bayIndex++) {
        box(
          [
            (bayIndex + 0.5) * EDGE_BUILDING_BAY_WIDTH,
            baseY + frameHeight / 2,
            EDGE_BUILDING_FRONT_Z,
          ],
          [0.05, frameHeight, 0.04],
          ALBEDO.glazingFrame,
        );
      }
    }

    if (hasDiagonalBraces) {
      for (let floorIndex = 0; floorIndex < floorCount; floorIndex += 2) {
        const baseY = floorIndex * EDGE_BUILDING_FLOOR_HEIGHT;
        const height = Math.min(
          EDGE_BUILDING_FLOOR_HEIGHT * 2,
          builtHeight - baseY,
        );
        if (height <= 0.001) {
          break;
        }
        for (let bayIndex = 0; bayIndex < EDGE_BUILDING_BAY_COUNT; bayIndex++) {
          for (const direction of [-1, 1]) {
            const centerX = (bayIndex + 0.5) * EDGE_BUILDING_BAY_WIDTH;
            addBeam(
              frame,
              [
                centerX - (direction * EDGE_BUILDING_BAY_WIDTH) / 2,
                baseY,
                EDGE_BUILDING_FRONT_Z + 0.06,
              ],
              [
                centerX + (direction * EDGE_BUILDING_BAY_WIDTH) / 2,
                baseY + height,
                EDGE_BUILDING_FRONT_Z + 0.06,
              ],
              0.065,
              ALBEDO.slab,
            );
          }
        }
      }
    }

    const topY = builtFloors * EDGE_BUILDING_FLOOR_HEIGHT;
    if (builtFloors <= 0.001) {
      return;
    }
    for (let lineIndex = 0; lineIndex <= EDGE_BUILDING_BAY_COUNT; lineIndex++) {
      for (const columnZ of [EDGE_BUILDING_FRONT_Z, EDGE_BUILDING_BACK_Z]) {
        for (const barOffset of [-0.025, 0.025]) {
          box(
            [
              lineIndex * EDGE_BUILDING_BAY_WIDTH + barOffset,
              topY + 0.09,
              columnZ,
            ],
            [0.03, 0.18, 0.03],
            ALBEDO.rebar,
          );
        }
      }
    }
  };

  const getClusterScale = (
    zoneWidth: number,
    clusterWidth: number,
    clusterHeight: number,
  ) =>
    Math.max(
      MINIMUM_CLUSTER_SCALE,
      Math.min(
        MAXIMUM_CLUSTER_SCALE,
        zoneWidth / clusterWidth,
        sceneHeight / clusterHeight,
      ),
    );

  const zoneInnerX = contentHalfWidth + CONTENT_GAP;
  const zoneOuterX = halfWidth - EDGE_MARGIN;
  const zoneWidth = zoneOuterX - zoneInnerX;
  const siteScale = Math.min(
    getClusterScale(
      zoneWidth,
      ROUND_TOWER_CLUSTER_WIDTH,
      ROUND_TOWER_CLUSTER_HEIGHT,
    ),
    getClusterScale(
      zoneWidth,
      BRACED_TOWER_CLUSTER_WIDTH,
      BRACED_TOWER_CLUSTER_HEIGHT,
    ),
  );

  const roundClusterWidth = ROUND_TOWER_CLUSTER_WIDTH * siteScale;
  const bracedClusterWidth = BRACED_TOWER_CLUSTER_WIDTH * siteScale;
  const roundClusterLeftX = -Math.min(
    (zoneInnerX + zoneOuterX + roundClusterWidth) / 2,
    zoneOuterX,
  );
  const bracedClusterLeftX = Math.min(
    (zoneInnerX + zoneOuterX - bracedClusterWidth) / 2,
    zoneOuterX - bracedClusterWidth,
  );
  addRoundTower(createFrame(roundClusterLeftX, 0, siteScale));
  addSmallRoundTower(
    createFrame(
      bracedClusterLeftX + 0.55 * siteScale,
      -0.15 * siteScale,
      siteScale,
    ),
  );
  addBracedTowerCluster(createFrame(bracedClusterLeftX, 0, siteScale));
  addEdgeBuilding(
    createFrame(
      -halfWidth -
        (EDGE_BUILDING_BAY_COUNT * EDGE_BUILDING_BAY_WIDTH -
          LEFT_EDGE_TOWER_VISIBLE_WIDTH) *
          siteScale,
      0,
      siteScale,
    ),
    {
      builtFloorsByStage: LEFT_EDGE_TOWER_BUILT_FLOORS_BY_STAGE,
      framedFloorsByStage: LEFT_EDGE_TOWER_FRAMED_FLOORS_BY_STAGE,
    },
  );
  addEdgeBuilding(
    createFrame(
      halfWidth - EDGE_BUILDING_VISIBLE_WIDTH * siteScale,
      0,
      siteScale,
    ),
    { hasDiagonalBraces: true },
  );
};
