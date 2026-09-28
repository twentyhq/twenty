import {
  buildOnboardingConstructionSiteScene,
  ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
  ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE,
} from '@/onboarding/components/OnboardingConstructionSite/buildOnboardingConstructionSiteScene';
import { type OnboardingConstructionSiteConstruction } from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteConstruction.type';
import { type OnboardingConstructionSiteInstances } from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteInstances.type';

const LAYOUT = {
  halfWidth: 5.5,
  halfHeight: 3.44,
  contentHalfWidth: 2.2,
  groundY: -3.44,
};

const createBatch = (capacity: number) => ({
  data: new Float32Array(
    capacity * ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE,
  ),
  count: 0,
});

const createInstances = (
  cubeCapacity = 1024,
): OnboardingConstructionSiteInstances => ({
  cube: createBatch(cubeCapacity),
  cylinder: createBatch(256),
  cone: createBatch(16),
  mixerDrum: createBatch(4),
});

const buildScene = (
  construction: OnboardingConstructionSiteConstruction,
  cubeCapacity?: number,
  craneMotion = 0,
) => {
  const instances = createInstances(cubeCapacity);
  buildOnboardingConstructionSiteScene({
    instances,
    layout: LAYOUT,
    construction,
    craneMotion,
  });
  return instances;
};

const buildSettledScene = (stageIndex: number, cubeCapacity?: number) =>
  buildScene(
    { builtStageIndex: stageIndex, growingStageGrowths: [] },
    cubeCapacity,
  );

const getTotalCount = (instances: OnboardingConstructionSiteInstances) =>
  Object.values(instances).reduce((total, batch) => total + batch.count, 0);

const getInstanceMatrices = (
  batch: OnboardingConstructionSiteInstances['cube'],
) =>
  Array.from({ length: batch.count }, (_, index) => {
    const offset = index * ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE;
    return batch.data.slice(
      offset,
      offset + ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE,
    );
  });

const getSuspendedLoads = ({ cube }: OnboardingConstructionSiteInstances) =>
  getInstanceMatrices(cube).filter(
    (instance) => Math.abs(instance[16] - 0.8) < 0.001,
  );

describe('buildOnboardingConstructionSiteScene', () => {
  it('should add more of the site with every stage', () => {
    const counts = [
      0,
      1,
      2,
      3,
      4,
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
    ]
      .map((stageIndex) => buildSettledScene(stageIndex))
      .map(getTotalCount);

    expect(counts[0]).toBeGreaterThan(0);
    counts.slice(1).forEach((count, index) => {
      expect(count).toBeGreaterThan(counts[index]);
    });
  });

  it('should start with only the static site details', () => {
    const emptySiteCount = getTotalCount(buildSettledScene(-1));

    expect(emptySiteCount).toBeGreaterThan(1);
    expect(getTotalCount(buildSettledScene(0))).toBeGreaterThan(emptySiteCount);
  });

  it('should grow a transition in from the ground up', () => {
    const settledCount = getTotalCount(buildSettledScene(1));
    const growingCount = getTotalCount(
      buildScene({ builtStageIndex: 1, growingStageGrowths: [0.2] }),
    );
    const nextSettledCount = getTotalCount(buildSettledScene(2));

    expect(growingCount).toBeGreaterThan(settledCount);
    expect(growingCount).toBeLessThan(nextSettledCount);
  });

  it('should land on the same site at either end of a transition', () => {
    const buildTransitionFromThirdToLastStage = (growth: number) =>
      buildScene({
        builtStageIndex: 3,
        growingStageGrowths: [growth, growth],
      });

    expect(getTotalCount(buildTransitionFromThirdToLastStage(0))).toBe(
      getTotalCount(buildSettledScene(3)),
    );
    expect(getTotalCount(buildTransitionFromThirdToLastStage(1))).toBe(
      getTotalCount(
        buildSettledScene(ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX),
      ),
    );
  });

  it('should only top out the tower for the finale', () => {
    const coneCountBeforeFinale = buildSettledScene(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX - 1,
    ).cone.count;
    const coneCountAtFinale = buildSettledScene(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
    ).cone.count;

    expect(coneCountAtFinale).toBeGreaterThan(coneCountBeforeFinale);
  });

  it('should park the mixer facing left from before the first step', () => {
    const parked = buildSettledScene(0).mixerDrum.data;

    expect(parked[12]).toBeLessThan(LAYOUT.halfWidth);
    expect(parked[4]).toBeLessThan(0);
    expect(buildSettledScene(-1).mixerDrum.data).toEqual(parked);
  });

  it('should turn the mixer around before driving back off the right edge', () => {
    const turning = buildScene({
      builtStageIndex: 0,
      growingStageGrowths: [0.325],
    }).mixerDrum.data;
    const turned = buildScene({
      builtStageIndex: 0,
      growingStageGrowths: [0.55],
    }).mixerDrum.data;
    const exited = buildSettledScene(1).mixerDrum.data;

    expect(turning[4]).toBeCloseTo(0);
    expect(turning[6]).toBeGreaterThan(0);
    expect(turned[4]).toBeGreaterThan(0);
    expect(turned[12]).toBeLessThan(LAYOUT.halfWidth);
    expect(exited[12]).toBeGreaterThan(LAYOUT.halfWidth);
    expect(buildSettledScene(2).mixerDrum.data).toEqual(exited);
  });

  it('should accelerate toward the edge after completing the truck turn', () => {
    const positions = [0.55, 0.7, 0.85, 1].map(
      (growth) =>
        buildScene({ builtStageIndex: 0, growingStageGrowths: [growth] })
          .mixerDrum.data[12],
    );
    const distances = positions
      .slice(1)
      .map((position, index) => position - positions[index]);
    expect(distances[1]).toBeGreaterThan(distances[0]);
    expect(distances[2]).toBeGreaterThan(distances[1]);
  });

  it('should lower crane loads vertically over their buildings without swinging', () => {
    const construction = {
      builtStageIndex: 2,
      growingStageGrowths: [0.25],
    };
    const raised = getSuspendedLoads(buildScene(construction));
    const lowered = getSuspendedLoads(buildScene(construction, undefined, 1));

    expect(raised).toHaveLength(2);
    expect(lowered).toHaveLength(2);
    lowered.forEach((load, index) => {
      expect(load.slice(0, 12)).toEqual(raised[index].slice(0, 12));
      expect(load[12]).toBe(raised[index][12]);
      expect(load[14]).toBe(raised[index][14]);
      expect(load[13]).toBeLessThan(raised[index][13]);
    });
  });

  it('should release delivered loads and leave the hooks empty between steps', () => {
    expect(
      getSuspendedLoads(
        buildScene({ builtStageIndex: 2, growingStageGrowths: [0.75] }),
      ),
    ).toHaveLength(0);
    expect(getSuspendedLoads(buildSettledScene(3))).toHaveLength(0);
  });

  it('should land the load on the highest visible round floor during growth', () => {
    const scene = buildScene(
      { builtStageIndex: 2, growingStageGrowths: [0.25] },
      undefined,
      1,
    );
    const load = getSuspendedLoads(scene)[0];
    const floorTops = getInstanceMatrices(scene.cylinder)
      .filter(
        (instance) =>
          instance[16] === 1 &&
          Math.abs(instance[12] - load[12]) < instance[0] / 2,
      )
      .map((instance) => instance[13] + instance[5] / 2);

    expect(floorTops.length).toBeGreaterThan(0);
    expect(load[13] - load[5] / 2).toBeCloseTo(Math.max(...floorTops));
  });

  it('should fit the renderer instance buffers', () => {
    const instances = buildSettledScene(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
    );

    expect(instances.cube.count).toBeLessThan(1024);
    expect(instances.cylinder.count).toBeLessThan(256);
    expect(instances.cone.count).toBeLessThan(16);
    expect(instances.mixerDrum.count).toBeLessThan(4);
  });

  it('should never write past the instance buffers', () => {
    const instances = buildSettledScene(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
      8,
    );

    expect(instances.cube.count).toBe(8);
  });
});
