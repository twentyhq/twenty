import { isDefined } from 'twenty-shared/utils';

import { ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX } from '@/onboarding/components/OnboardingConstructionSite/buildOnboardingConstructionSiteScene';
import { type OnboardingConstructionSiteConstruction } from '@/onboarding/components/OnboardingConstructionSite/OnboardingConstructionSiteConstruction';

const INITIAL_STAGE_INDEX = -1;
const TRANSITION_SECONDS_PER_STEP = 1.6;

type Transition = {
  lowerStageIndex: number;
  segments: { upperStageIndex: number; startPosition: number }[];
  position: number;
  direction: 1 | -1;
  durationSeconds: number;
};

const clampToUnitRange = (value: number) => Math.max(0, Math.min(1, value));

const easeInOutCubic = (ratio: number) =>
  ratio < 0.5 ? 4 * ratio * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 3) / 2;

export type OnboardingConstructionSiteTimeline = {
  setTargetStageIndex: (stageIndex: number) => void;
  jumpToStageIndex: (stageIndex: number) => void;
  advance: (deltaSeconds: number) => void;
  isTransitioning: () => boolean;
  getConstruction: () => OnboardingConstructionSiteConstruction;
  getMotion: () => number;
  getFinaleBump: () => number;
};

export const createOnboardingConstructionSiteTimeline = ({
  transitionSecondsPerStep = TRANSITION_SECONDS_PER_STEP,
  easing = easeInOutCubic,
}: {
  transitionSecondsPerStep?: number;
  easing?: (ratio: number) => number;
} = {}): OnboardingConstructionSiteTimeline => {
  const getTransitionSeconds = (stepCount: number) =>
    transitionSecondsPerStep * Math.sqrt(stepCount);
  let settledStageIndex = INITIAL_STAGE_INDEX;
  let transition: Transition | null = null;
  let pendingStageIndex: number | null = null;

  const getUpperStageIndex = (activeTransition: Transition) =>
    activeTransition.segments[activeTransition.segments.length - 1]
      .upperStageIndex;

  const getTargetStageIndex = (activeTransition: Transition) =>
    activeTransition.direction > 0
      ? getUpperStageIndex(activeTransition)
      : activeTransition.lowerStageIndex;

  const getSourceStageIndex = (activeTransition: Transition) =>
    activeTransition.direction > 0
      ? activeTransition.lowerStageIndex
      : getUpperStageIndex(activeTransition);

  const startTransition = (targetStageIndex: number) => {
    if (targetStageIndex === settledStageIndex) {
      return;
    }

    const isBuildingUp = targetStageIndex > settledStageIndex;
    transition = {
      lowerStageIndex: Math.min(settledStageIndex, targetStageIndex),
      segments: [
        {
          upperStageIndex: Math.max(settledStageIndex, targetStageIndex),
          startPosition: 0,
        },
      ],
      position: isBuildingUp ? 0 : 1,
      direction: isBuildingUp ? 1 : -1,
      durationSeconds: getTransitionSeconds(
        Math.abs(targetStageIndex - settledStageIndex),
      ),
    };
  };

  const extendTransition = (
    activeTransition: Transition,
    targetStageIndex: number,
  ) => {
    const remainingRatio = Math.max(1 - activeTransition.position, 0.001);
    const remainingSeconds = Math.max(
      remainingRatio * activeTransition.durationSeconds,
      getTransitionSeconds(
        targetStageIndex - getUpperStageIndex(activeTransition),
      ),
    );
    activeTransition.segments.push({
      upperStageIndex: targetStageIndex,
      startPosition: activeTransition.position,
    });
    activeTransition.durationSeconds = remainingSeconds / remainingRatio;
  };

  const getGrowth = () =>
    isDefined(transition) ? easing(transition.position) : 1;

  return {
    setTargetStageIndex: (stageIndex) => {
      if (!isDefined(transition)) {
        startTransition(stageIndex);
      } else if (stageIndex === getTargetStageIndex(transition)) {
        pendingStageIndex = null;
      } else if (stageIndex === getSourceStageIndex(transition)) {
        transition.direction = transition.direction > 0 ? -1 : 1;
        pendingStageIndex = null;
      } else if (
        transition.direction > 0 &&
        stageIndex > getUpperStageIndex(transition)
      ) {
        extendTransition(transition, stageIndex);
        pendingStageIndex = null;
      } else {
        pendingStageIndex = stageIndex;
      }
    },
    jumpToStageIndex: (stageIndex) => {
      settledStageIndex = stageIndex;
      transition = null;
      pendingStageIndex = null;
    },
    advance: (deltaSeconds) => {
      if (!isDefined(transition)) {
        return;
      }

      transition.position = clampToUnitRange(
        transition.position +
          (transition.direction * deltaSeconds) / transition.durationSeconds,
      );
      if (transition.position !== (transition.direction > 0 ? 1 : 0)) {
        return;
      }

      settledStageIndex = getTargetStageIndex(transition);
      transition = null;
      if (isDefined(pendingStageIndex)) {
        startTransition(pendingStageIndex);
        pendingStageIndex = null;
      }
    },
    isTransitioning: () => isDefined(transition),
    getConstruction: () => {
      if (!isDefined(transition)) {
        return {
          builtStageIndex: settledStageIndex,
          growingStageGrowths: [],
        };
      }

      const { lowerStageIndex, segments, position } = transition;
      const growingStageGrowths = segments.flatMap(
        ({ upperStageIndex, startPosition }, segmentIndex) => {
          const segmentLowerStageIndex =
            segmentIndex === 0
              ? lowerStageIndex
              : segments[segmentIndex - 1].upperStageIndex;
          const growth = easing(
            clampToUnitRange((position - startPosition) / (1 - startPosition)),
          );
          return Array.from(
            { length: upperStageIndex - segmentLowerStageIndex },
            () => growth,
          );
        },
      );

      return { builtStageIndex: lowerStageIndex, growingStageGrowths };
    },
    getMotion: () =>
      isDefined(transition) ? Math.sin(Math.PI * getGrowth()) : 0,
    getFinaleBump: () =>
      isDefined(transition) &&
      getUpperStageIndex(transition) ===
        ONBOARDING_CONSTRUCTION_SITE_FINAL_STAGE_INDEX
        ? Math.pow(Math.sin(Math.PI * getGrowth()), 2)
        : 0,
  };
};
