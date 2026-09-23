import { isDefined } from 'twenty-shared/utils';

import {
  buildOnboardingHomeIllustrationCells,
  type OnboardingHomeIllustrationLayout,
} from '@/onboarding/components/OnboardingHomeIllustration/buildOnboardingHomeIllustrationCells';
import { type OnboardingHomeIllustrationStage } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationStage.type';
import { sampleOnboardingHomeIllustrationLuminances } from '@/onboarding/components/OnboardingHomeIllustration/sampleOnboardingHomeIllustrationLuminances';

const MAXIMUM_IMAGE_WIDTH = 560;
const TARGET_COLUMN_COUNT = 72;
const MINIMUM_PITCH = 5;
const MAXIMUM_PITCH = 7;
const MAXIMUM_DEVICE_PIXEL_RATIO = 2;
const MINIMUM_VISIBLE_INK = 0.08;
const MINIMUM_VISIBLE_OPACITY = 0.02;
const MINIMUM_STROKE_WIDTH = 0.6;
const MINIMUM_HALF_LENGTH = 0.01;
const STROKE_WIDTH_TO_PITCH_RATIO = 0.78;
const CAPSULE_LENGTH_TO_INK_RATIO = 1.2;
const STROKE_WIDTH_STEP = 0.25;
const OPACITY_LEVEL_COUNT = 8;
const MORPH_DURATION_SECONDS = 0.7;
const REDUCED_MOTION_DURATION_SECONDS = 0.4;
const FINALE_BURST_DURATION_SECONDS = 0.55;
const FINALE_BURST_DISTANCE_RATIO = 0.12;
const FINALE_ASSEMBLE_START_SECONDS = 0.1;
const FINALE_ASSEMBLE_DURATION_SECONDS = 0.9;
const FINALE_DASH_STRETCH_START_PROGRESS = 0.35;
const FINALE_DRIFT_RISE_SECONDS = 0.6;
const FINALE_DRIFT_DURATION_SECONDS = 1.8;

const clampToUnitRange = (value: number) => Math.max(0, Math.min(1, value));
const interpolate = (from: number, to: number, ratio: number) =>
  from + (to - from) * ratio;
const easeOutCubic = (ratio: number) => 1 - Math.pow(1 - ratio, 3);
const easeInOutCubic = (ratio: number) =>
  ratio < 0.5 ? 4 * ratio * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 3) / 2;
const easeOutBack = (ratio: number) =>
  1 + 2.70158 * Math.pow(ratio - 1, 3) + 1.70158 * Math.pow(ratio - 1, 2);
const smootherStep = (ratio: number) => ratio * ratio * (3 - 2 * ratio);

type Transition = {
  kind: 'morph' | 'finale';
  startTimeMs: number | null;
  fromInks: Float32Array;
  toInks: Float32Array;
};

type CreateOnboardingHomeIllustrationRendererOptions = {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  color: string;
  prefersReducedMotion: boolean;
};

export type OnboardingHomeIllustrationRenderer = {
  setStage: (stage: OnboardingHomeIllustrationStage) => void;
  resize: () => void;
  destroy: () => void;
};

export const createOnboardingHomeIllustrationRenderer = ({
  canvas,
  image,
  color,
  prefersReducedMotion,
}: CreateOnboardingHomeIllustrationRendererOptions): OnboardingHomeIllustrationRenderer | null => {
  const context = canvas.getContext('2d');
  if (!isDefined(context)) {
    return null;
  }

  const imageAspectRatio = image.naturalWidth / image.naturalHeight;
  const capsuleBatches = new Map<number, number[]>();

  let canvasWidth = 0;
  let canvasHeight = 0;
  let devicePixelRatio = 1;
  let layout: OnboardingHomeIllustrationLayout | null = null;
  let stage: OnboardingHomeIllustrationStage | null = null;
  let displayedInks: Float32Array = new Float32Array(0);
  let transition: Transition | null = null;
  let animationFrameHandle: number | null = null;

  const getStageInks = (targetStage: OnboardingHomeIllustrationStage) =>
    Float32Array.from(layout?.cells ?? [], (cell) =>
      !isDefined(cell.furnitureIndex) ||
      cell.furnitureIndex < targetStage.revealedFurnitureCount
        ? cell.photoInk
        : cell.roomInk,
    );

  const addCapsule = (
    x: number,
    y: number,
    ink: number,
    opacity: number,
    lengthRatio: number,
  ) => {
    if (
      !isDefined(layout) ||
      ink < MINIMUM_VISIBLE_INK ||
      opacity < MINIMUM_VISIBLE_OPACITY
    ) {
      return;
    }

    const strokeWidthLevel = Math.round(
      Math.max(
        MINIMUM_STROKE_WIDTH,
        layout.pitch * STROKE_WIDTH_TO_PITCH_RATIO * ink,
      ) / STROKE_WIDTH_STEP,
    );
    const opacityLevel = Math.max(
      1,
      Math.round(clampToUnitRange(opacity) * OPACITY_LEVEL_COUNT),
    );
    const halfLength = Math.max(
      MINIMUM_HALF_LENGTH,
      layout.pitch *
        0.5 *
        Math.min(1, ink * CAPSULE_LENGTH_TO_INK_RATIO) *
        lengthRatio,
    );
    const batchKey =
      strokeWidthLevel * (OPACITY_LEVEL_COUNT + 1) + opacityLevel;

    let batch = capsuleBatches.get(batchKey);
    if (!isDefined(batch)) {
      batch = [];
      capsuleBatches.set(batchKey, batch);
    }
    batch.push(x - halfLength, y, x + halfLength, y);
  };

  const flushCapsules = () => {
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.strokeStyle = color;
    context.lineCap = 'round';

    for (const [batchKey, batch] of capsuleBatches) {
      if (batch.length === 0) {
        continue;
      }

      context.lineWidth =
        Math.floor(batchKey / (OPACITY_LEVEL_COUNT + 1)) * STROKE_WIDTH_STEP;
      context.globalAlpha =
        (batchKey % (OPACITY_LEVEL_COUNT + 1)) / OPACITY_LEVEL_COUNT;
      context.beginPath();
      for (let offset = 0; offset < batch.length; offset += 4) {
        context.moveTo(batch[offset], batch[offset + 1]);
        context.lineTo(batch[offset + 2], batch[offset + 3]);
      }
      context.stroke();
      batch.length = 0;
    }

    context.globalAlpha = 1;
  };

  const drawStaticFrame = () => {
    layout?.cells.forEach((cell, cellIndex) =>
      addCapsule(cell.x, cell.y, displayedInks[cellIndex], 1, 1),
    );
    flushCapsules();
  };

  const drawMorphFrame = (
    activeTransition: Transition,
    elapsedSeconds: number,
  ) => {
    let isComplete = true;

    layout?.cells.forEach((cell, cellIndex) => {
      const fromInk = activeTransition.fromInks[cellIndex];
      const toInk = activeTransition.toInks[cellIndex];

      if (fromInk === toInk) {
        addCapsule(cell.x, cell.y, toInk, 1, 1);
        return;
      }

      const progress = clampToUnitRange(
        prefersReducedMotion
          ? elapsedSeconds / REDUCED_MOTION_DURATION_SECONDS
          : (elapsedSeconds - cell.revealDelaySeconds) / MORPH_DURATION_SECONDS,
      );
      if (progress < 1) {
        isComplete = false;
      }

      const easedProgress =
        prefersReducedMotion || toInk < fromInk
          ? easeInOutCubic(progress)
          : easeOutBack(progress);
      addCapsule(
        cell.x,
        cell.y,
        interpolate(fromInk, toInk, easedProgress),
        1,
        1,
      );
    });

    return isComplete;
  };

  const drawReducedMotionFinaleFrame = (
    activeTransition: Transition,
    elapsedSeconds: number,
  ) => {
    const progress = clampToUnitRange(
      elapsedSeconds / REDUCED_MOTION_DURATION_SECONDS,
    );

    layout?.cells.forEach((cell, cellIndex) => {
      addCapsule(
        cell.x,
        cell.y,
        activeTransition.fromInks[cellIndex],
        1 - progress,
        1,
      );
      addCapsule(
        cell.x,
        cell.y,
        activeTransition.toInks[cellIndex],
        progress,
        1,
      );
    });

    return progress >= 1;
  };

  const drawFinaleFrame = (
    activeTransition: Transition,
    elapsedSeconds: number,
  ) => {
    if (!isDefined(layout)) {
      return true;
    }

    const { size } = layout;
    const burstProgress = clampToUnitRange(
      elapsedSeconds / FINALE_BURST_DURATION_SECONDS,
    );
    const assembleElapsedSeconds =
      elapsedSeconds - FINALE_ASSEMBLE_START_SECONDS;
    let isComplete = true;

    layout.cells.forEach((cell, cellIndex) => {
      if (burstProgress < 1) {
        const burstDistance =
          smootherStep(burstProgress) *
          size *
          FINALE_BURST_DISTANCE_RATIO *
          (0.6 + 0.8 * cell.distanceToCenterRatio);
        addCapsule(
          cell.x + cell.burstDirectionX * burstDistance,
          cell.y + cell.burstDirectionY * burstDistance,
          activeTransition.fromInks[cellIndex],
          1 - easeOutCubic(clampToUnitRange(burstProgress / 0.85)),
          1,
        );
      }

      const landingSeconds =
        cell.finaleDelaySeconds + FINALE_ASSEMBLE_DURATION_SECONDS;
      if (
        assembleElapsedSeconds <
        landingSeconds + FINALE_DRIFT_DURATION_SECONDS
      ) {
        isComplete = false;
      }

      const assembleProgress = easeOutCubic(
        clampToUnitRange(
          (assembleElapsedSeconds - cell.finaleDelaySeconds) /
            FINALE_ASSEMBLE_DURATION_SECONDS,
        ),
      );
      if (assembleProgress <= 0) {
        return;
      }

      const secondsSinceLanding = assembleElapsedSeconds - landingSeconds;
      const driftAmount =
        secondsSinceLanding > 0
          ? clampToUnitRange(secondsSinceLanding / FINALE_DRIFT_RISE_SECONDS) *
            (1 -
              smootherStep(
                clampToUnitRange(
                  secondsSinceLanding / FINALE_DRIFT_DURATION_SECONDS,
                ),
              ))
          : 0;

      addCapsule(
        interpolate(cell.scatterX, cell.x, assembleProgress) +
          Math.sin(elapsedSeconds * 1.1 + cell.driftPhase) * driftAmount * 0.5,
        interpolate(cell.scatterY, cell.y, assembleProgress) +
          Math.cos(elapsedSeconds * 0.95 + cell.driftPhase) *
            driftAmount *
            0.35,
        activeTransition.toInks[cellIndex],
        assembleProgress,
        clampToUnitRange(
          (assembleProgress - FINALE_DASH_STRETCH_START_PROGRESS) /
            (1 - FINALE_DASH_STRETCH_START_PROGRESS),
        ),
      );
    });

    return isComplete;
  };

  const drawTransitionFrame = (timeMs: number) => {
    animationFrameHandle = null;
    if (!isDefined(transition)) {
      return;
    }

    if (!isDefined(transition.startTimeMs)) {
      transition.startTimeMs = timeMs;
    }
    const elapsedSeconds = (timeMs - transition.startTimeMs) / 1000;

    const isComplete =
      transition.kind === 'morph'
        ? drawMorphFrame(transition, elapsedSeconds)
        : prefersReducedMotion
          ? drawReducedMotionFinaleFrame(transition, elapsedSeconds)
          : drawFinaleFrame(transition, elapsedSeconds);
    flushCapsules();

    if (isComplete) {
      displayedInks = transition.toInks;
      transition = null;
      drawStaticFrame();
      return;
    }

    animationFrameHandle = requestAnimationFrame(drawTransitionFrame);
  };

  const startTransition = (
    kind: Transition['kind'],
    fromInks: Float32Array,
    toInks: Float32Array,
  ) => {
    transition = { kind, startTimeMs: null, fromInks, toInks };
    if (!isDefined(animationFrameHandle)) {
      animationFrameHandle = requestAnimationFrame(drawTransitionFrame);
    }
  };

  const stopTransition = () => {
    if (isDefined(animationFrameHandle)) {
      cancelAnimationFrame(animationFrameHandle);
      animationFrameHandle = null;
    }
    transition = null;
  };

  const resize = () => {
    const nextCanvasWidth = canvas.clientWidth;
    const nextCanvasHeight = canvas.clientHeight;
    const nextDevicePixelRatio = Math.min(
      window.devicePixelRatio || 1,
      MAXIMUM_DEVICE_PIXEL_RATIO,
    );

    if (
      isDefined(layout) &&
      nextCanvasWidth === canvasWidth &&
      nextCanvasHeight === canvasHeight &&
      nextDevicePixelRatio === devicePixelRatio
    ) {
      return;
    }

    canvasWidth = nextCanvasWidth;
    canvasHeight = nextCanvasHeight;
    devicePixelRatio = nextDevicePixelRatio;
    canvas.width = Math.round(canvasWidth * devicePixelRatio);
    canvas.height = Math.round(canvasHeight * devicePixelRatio);

    const imageWidth = Math.min(
      canvasWidth,
      canvasHeight * imageAspectRatio,
      MAXIMUM_IMAGE_WIDTH,
    );
    const pitch = Math.min(
      MAXIMUM_PITCH,
      Math.max(MINIMUM_PITCH, imageWidth / TARGET_COLUMN_COUNT),
    );
    const columns = Math.floor(imageWidth / pitch);
    const rows = Math.floor(imageWidth / imageAspectRatio / pitch);
    const luminances =
      columns > 0 && rows > 0
        ? sampleOnboardingHomeIllustrationLuminances(image, columns, rows)
        : null;

    const wasAnimatingFinale = transition?.kind === 'finale';
    stopTransition();

    layout = isDefined(luminances)
      ? buildOnboardingHomeIllustrationCells({
          luminances,
          columns,
          rows,
          pitch,
          originX: (canvasWidth - columns * pitch) / 2,
          originY: (canvasHeight - rows * pitch) / 2,
        })
      : null;

    if (!isDefined(stage)) {
      return;
    }

    if (wasAnimatingFinale) {
      startTransition(
        'finale',
        new Float32Array(layout?.cells.length ?? 0),
        getStageInks(stage),
      );
      return;
    }

    displayedInks = getStageInks(stage);
    drawStaticFrame();
  };

  const setStage = (nextStage: OnboardingHomeIllustrationStage) => {
    const previousStage = stage;
    stage = nextStage;

    if (
      isDefined(previousStage) &&
      previousStage.revealedFurnitureCount ===
        nextStage.revealedFurnitureCount &&
      previousStage.isFinale === nextStage.isFinale
    ) {
      return;
    }

    if (!isDefined(layout)) {
      return;
    }

    const nextInks = getStageInks(nextStage);

    if (nextStage.isFinale && previousStage?.isFinale !== true) {
      const fromInks = isDefined(previousStage)
        ? (transition?.toInks ?? displayedInks)
        : new Float32Array(nextInks.length);
      startTransition('finale', fromInks, nextInks);
      return;
    }

    if (!isDefined(previousStage)) {
      displayedInks = nextInks;
      drawStaticFrame();
      return;
    }

    startTransition('morph', transition?.toInks ?? displayedInks, nextInks);
  };

  resize();

  return {
    setStage,
    resize,
    destroy: stopTransition,
  };
};
