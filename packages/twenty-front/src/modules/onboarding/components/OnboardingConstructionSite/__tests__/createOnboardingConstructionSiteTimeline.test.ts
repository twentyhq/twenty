import { ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX } from '@/onboarding/components/OnboardingConstructionSite/buildOnboardingConstructionSiteScene';
import {
  createOnboardingConstructionSiteTimeline,
  type OnboardingConstructionSiteTimeline,
} from '@/onboarding/components/OnboardingConstructionSite/createOnboardingConstructionSiteTimeline';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { getValueOrThrow } from '@/onboarding/components/OnboardingConstructionSite/__tests__/utils/getValueOrThrow';

const FRAME_SECONDS = 1 / 60;

const advanceBySeconds = (
  timeline: OnboardingConstructionSiteTimeline,
  seconds: number,
) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += FRAME_SECONDS) {
    timeline.advance(FRAME_SECONDS);
  }
};

const createSettledTimeline = (stageIndex: number) => {
  const timeline = createOnboardingConstructionSiteTimeline();
  timeline.jumpToStageIndex(stageIndex);
  return timeline;
};

describe('createOnboardingConstructionSiteTimeline', () => {
  it('should support a longer linear truck transition without changing building timing', () => {
    const buildings = createSettledTimeline(0);
    const truck = createOnboardingConstructionSiteTimeline({
      transitionSecondsPerStep: 2.2,
      easing: (ratio) => ratio,
    });
    truck.jumpToStageIndex(0);
    buildings.setTargetStageIndex(1);
    truck.setTargetStageIndex(1);
    buildings.advance(1.6);
    truck.advance(1.6);

    expect(buildings.isTransitioning()).toBe(false);
    expect(truck.isTransitioning()).toBe(true);
    expect(truck.getConstruction().growingStageGrowths[0]).toBeCloseTo(
      1.6 / 2.2,
    );
    truck.advance(0.61);
    expect(truck.isTransitioning()).toBe(false);
    expect(truck.getConstruction().builtStageIndex).toBe(1);
  });

  it('should build the site from empty up to the first step, then rest', () => {
    const timeline = createOnboardingConstructionSiteTimeline();

    timeline.setTargetStageIndex(2);

    expect(timeline.getConstruction()).toEqual({
      builtStageIndex: -1,
      growingStageGrowths: [0, 0, 0],
    });

    advanceBySeconds(timeline, 10);

    expect(timeline.isTransitioning()).toBe(false);
    expect(timeline.getConstruction()).toEqual({
      builtStageIndex: 2,
      growingStageGrowths: [],
    });
  });

  it('should grow a jump over several steps in a single sweep', () => {
    const timeline = createSettledTimeline(3);
    const growths: number[] = [];

    timeline.setTargetStageIndex(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
    );
    while (timeline.isTransitioning()) {
      const { builtStageIndex, growingStageGrowths } =
        timeline.getConstruction();

      expect(builtStageIndex).toBe(3);
      expect(growingStageGrowths).toHaveLength(2);
      expect(growingStageGrowths[1]).toBe(growingStageGrowths[0]);
      growths.push(getValueOrThrow(growingStageGrowths, 0));
      timeline.advance(FRAME_SECONDS);
    }

    growths.slice(1).forEach((growth, index) => {
      expect(growth).toBeGreaterThanOrEqual(getValueOrThrow(growths, index));
    });
    expect(timeline.getConstruction().builtStageIndex).toBe(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
    );
  });

  it('should settle the motion, light and shimmer as the transition lands', () => {
    const timeline = createSettledTimeline(3);

    timeline.setTargetStageIndex(
      ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX,
    );
    advanceBySeconds(timeline, 1);

    expect(timeline.getMotion()).toBeGreaterThan(0);
    expect(timeline.getFinaleBump()).toBeGreaterThan(0);

    advanceBySeconds(timeline, 10);

    expect(timeline.isTransitioning()).toBe(false);
    expect(timeline.getMotion()).toBe(0);
    expect(timeline.getFinaleBump()).toBe(0);
  });

  it('should keep the light still on steps before the last one', () => {
    const timeline = createSettledTimeline(2);

    timeline.setTargetStageIndex(3);
    advanceBySeconds(timeline, 0.8);

    expect(timeline.getFinaleBump()).toBe(0);
  });

  it('should reverse from what is on screen when going back mid-transition', () => {
    const timeline = createSettledTimeline(3);

    timeline.setTargetStageIndex(4);
    advanceBySeconds(timeline, 0.8);
    const [growthWhenGoingBack] =
      timeline.getConstruction().growingStageGrowths;
    assertIsDefinedOrThrow(growthWhenGoingBack);
    timeline.setTargetStageIndex(3);
    timeline.advance(FRAME_SECONDS);
    const [growthAfterGoingBack] =
      timeline.getConstruction().growingStageGrowths;

    expect(growthAfterGoingBack).toBeLessThan(growthWhenGoingBack);
    expect(growthAfterGoingBack).toBeGreaterThan(growthWhenGoingBack - 0.05);

    advanceBySeconds(timeline, 10);

    expect(timeline.getConstruction()).toEqual({
      builtStageIndex: 3,
      growingStageGrowths: [],
    });
  });

  it('should fold a step that skips itself into the running transition', () => {
    const timeline = createSettledTimeline(0);

    timeline.setTargetStageIndex(1);
    advanceBySeconds(timeline, 0.4);
    const [firstStepGrowthWhenJoined] =
      timeline.getConstruction().growingStageGrowths;
    timeline.setTargetStageIndex(2);

    expect(timeline.getConstruction()).toEqual({
      builtStageIndex: 0,
      growingStageGrowths: [firstStepGrowthWhenJoined, 0],
    });

    while (timeline.isTransitioning()) {
      const { builtStageIndex, growingStageGrowths } =
        timeline.getConstruction();

      expect(builtStageIndex).toBe(0);
      expect(growingStageGrowths[1]).toBeLessThanOrEqual(
        getValueOrThrow(growingStageGrowths, 0),
      );
      timeline.advance(FRAME_SECONDS);
    }

    expect(timeline.getConstruction()).toEqual({
      builtStageIndex: 2,
      growingStageGrowths: [],
    });
  });

  it('should play a step reached while going back once it lands', () => {
    const timeline = createSettledTimeline(3);

    timeline.setTargetStageIndex(2);
    advanceBySeconds(timeline, 0.5);
    timeline.setTargetStageIndex(1);

    expect(timeline.getConstruction().builtStageIndex).toBe(2);

    advanceBySeconds(timeline, 20);

    expect(timeline.isTransitioning()).toBe(false);
    expect(timeline.getConstruction().builtStageIndex).toBe(1);
  });
});
