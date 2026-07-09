import { isDefined } from 'twenty-shared/utils';

import { buildWelcomeHalftoneParticles } from '@/onboarding/components/WelcomeOverlay/buildWelcomeHalftoneParticles';
import { createWelcomeHalftoneAnimationFrameLoop } from '@/onboarding/components/WelcomeOverlay/createWelcomeHalftoneAnimationFrameLoop';
import { type WelcomeHalftoneParticle } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneParticle.type';

const DASH_ASSEMBLE_DURATION_SECONDS = 0.62;
const BURST_DURATION_SECONDS = 0.75;
const SETTLE_DRIFT_DURATION_SECONDS = 0.6;
const SHIMMER_BAND_HALF_WIDTH = 0.028;
const MINIMUM_VISIBLE_OPACITY = 0.01;

const clampToUnitRange = (value: number) => Math.max(0, Math.min(1, value));
const interpolate = (from: number, to: number, ratio: number) =>
  from + (to - from) * ratio;
const easeOutCubic = (ratio: number) => 1 - Math.pow(1 - ratio, 3);
const easeOutExpo = (ratio: number) =>
  ratio >= 1 ? 1 : 1 - Math.pow(2, -10 * ratio);
const smootherStep = (ratio: number) => ratio * ratio * (3 - 2 * ratio);

type WelcomeHalftoneRendererOptions = {
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  dashes: readonly (readonly [number, number, number, number])[];
  width: number;
  height: number;
  devicePixelRatio: number;
  color: string;
  highlightColor: string;
  reducedMotion: boolean;
};

export const createWelcomeHalftoneRenderer = (
  options: WelcomeHalftoneRendererOptions,
) => {
  const { context, dashes, reducedMotion } = options;
  const baseColor = options.color;
  const highlightColor = options.highlightColor;

  let canvasWidth = options.width;
  let canvasHeight = options.height;
  let devicePixelRatio = options.devicePixelRatio;

  let particles: WelcomeHalftoneParticle[] = [];
  let halftoneSize = 0;
  let maxDistanceToCenter = 1;

  let firstFrameTimeMs: number | null = null;
  let leaveStartSeconds: number | null = null;
  let hasLeaveBeenRequested = false;

  const animationFrameLoop = createWelcomeHalftoneAnimationFrameLoop();

  const rebuildParticlesForCurrentSize = () => {
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.lineCap = 'round';
    const layout = buildWelcomeHalftoneParticles(
      dashes,
      canvasWidth,
      canvasHeight,
    );
    particles = layout.particles;
    halftoneSize = layout.halftoneSize;
    maxDistanceToCenter = layout.maxDistanceToCenter;
  };

  const computeAssembleState = (
    particle: WelcomeHalftoneParticle,
    elapsedSeconds: number,
  ) => {
    const assembleProgress = easeOutExpo(
      clampToUnitRange(
        (elapsedSeconds - particle.assembleDelaySeconds) /
          DASH_ASSEMBLE_DURATION_SECONDS,
      ),
    );
    let particleX = interpolate(
      particle.scatterStartX,
      particle.targetX,
      assembleProgress,
    );
    let particleY = interpolate(
      particle.scatterStartY,
      particle.targetY,
      assembleProgress,
    );
    const settleDriftProgress = clampToUnitRange(
      (elapsedSeconds -
        (particle.assembleDelaySeconds + DASH_ASSEMBLE_DURATION_SECONDS)) /
        SETTLE_DRIFT_DURATION_SECONDS,
    );
    particleX +=
      Math.sin(elapsedSeconds * 1.6 + particle.driftPhase) *
      settleDriftProgress *
      1.2;
    particleY +=
      Math.cos(elapsedSeconds * 1.4 + particle.driftPhase) *
      settleDriftProgress *
      0.8;
    return { particleX, particleY, opacity: assembleProgress };
  };

  const drawFrame = (timeMs: number) => {
    if (!isDefined(firstFrameTimeMs)) {
      firstFrameTimeMs = timeMs;
    }
    const elapsedSeconds = (timeMs - firstFrameTimeMs) / 1000;

    if (hasLeaveBeenRequested && !isDefined(leaveStartSeconds)) {
      leaveStartSeconds = elapsedSeconds;
      for (const particle of particles) {
        if (reducedMotion) {
          particle.positionAtLeaveStartX = particle.targetX;
          particle.positionAtLeaveStartY = particle.targetY;
          particle.opacityAtLeaveStart = 1;
        } else {
          const assembleState = computeAssembleState(particle, elapsedSeconds);
          particle.positionAtLeaveStartX = assembleState.particleX;
          particle.positionAtLeaveStartY = assembleState.particleY;
          particle.opacityAtLeaveStart = assembleState.opacity;
        }
      }
    }

    const isLeaving = isDefined(leaveStartSeconds);
    const burstProgress = isDefined(leaveStartSeconds)
      ? clampToUnitRange(
          (elapsedSeconds - leaveStartSeconds) / BURST_DURATION_SECONDS,
        )
      : 0;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const shimmerSweepPosition = ((elapsedSeconds * 0.5) % 1.3) / 1.3;
    const isShimmerActive = !reducedMotion && !isLeaving;
    const inverseViewportSpan = 1 / (canvasWidth + canvasHeight);
    let currentStrokeColor = '';

    for (const particle of particles) {
      let particleX: number;
      let particleY: number;
      let particleOpacity: number;
      let capsuleLength = particle.dashLength;
      let capsuleDirectionX = 1;
      let capsuleDirectionY = 0;

      if (reducedMotion) {
        particleX = particle.targetX;
        particleY = particle.targetY;
        particleOpacity = isLeaving ? 1 - burstProgress : 1;
      } else if (!isLeaving) {
        const assembleState = computeAssembleState(particle, elapsedSeconds);
        particleX = assembleState.particleX;
        particleY = assembleState.particleY;
        particleOpacity = assembleState.opacity;
      } else {
        const easedBurstProgress = smootherStep(burstProgress);
        const outwardPushDistance =
          easedBurstProgress *
          halftoneSize *
          1.1 *
          (0.6 + 0.8 * (particle.distanceToCenter / maxDistanceToCenter));
        particleX =
          particle.positionAtLeaveStartX +
          particle.burstDirectionX * outwardPushDistance;
        particleY =
          particle.positionAtLeaveStartY +
          particle.burstDirectionY * outwardPushDistance;
        particleOpacity =
          particle.opacityAtLeaveStart *
          (1 - easeOutCubic(clampToUnitRange(burstProgress / 0.85)));
        capsuleLength =
          particle.dashLength + outwardPushDistance * 0.12 * burstProgress;
        capsuleDirectionX = particle.burstDirectionX;
        capsuleDirectionY = particle.burstDirectionY;
      }

      if (particleOpacity <= MINIMUM_VISIBLE_OPACITY) {
        continue;
      }

      const isParticleInShimmerBand =
        isShimmerActive &&
        Math.abs(
          (particleX + particleY) * inverseViewportSpan - shimmerSweepPosition,
        ) < SHIMMER_BAND_HALF_WIDTH;
      const strokeColor = isParticleInShimmerBand ? highlightColor : baseColor;
      if (strokeColor !== currentStrokeColor) {
        context.strokeStyle = strokeColor;
        currentStrokeColor = strokeColor;
      }

      context.globalAlpha = particleOpacity;
      context.lineWidth = particle.strokeWidth;
      context.beginPath();
      const halfCapsuleX = (capsuleDirectionX * capsuleLength) / 2;
      const halfCapsuleY = (capsuleDirectionY * capsuleLength) / 2;
      context.moveTo(particleX - halfCapsuleX, particleY - halfCapsuleY);
      context.lineTo(particleX + halfCapsuleX, particleY + halfCapsuleY);
      context.stroke();
    }

    context.globalAlpha = 1;
    animationFrameLoop.requestNextFrame(drawFrame);
  };

  rebuildParticlesForCurrentSize();
  animationFrameLoop.requestNextFrame(drawFrame);

  return {
    leave: () => {
      hasLeaveBeenRequested = true;
    },
    resize: (
      nextCanvasWidth: number,
      nextCanvasHeight: number,
      nextDevicePixelRatio: number,
    ) => {
      canvasWidth = nextCanvasWidth;
      canvasHeight = nextCanvasHeight;
      devicePixelRatio = nextDevicePixelRatio;
      rebuildParticlesForCurrentSize();
    },
    destroy: () => {
      animationFrameLoop.cancelPendingFrame();
    },
  };
};
