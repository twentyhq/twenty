import { type WelcomeHalftoneParticle } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneParticle.type';

const TAU = Math.PI * 2;
const VIEWBOX_WIDTH = 297.037;
const VIEWBOX_CENTER_X = 148.5;
const VIEWBOX_CENTER_Y = 119.5;
const ASSEMBLE_STAGGER_SECONDS = 0.18;
const ASSEMBLE_JITTER_SECONDS = 0.12;
const MINIMUM_STROKE_WIDTH = 0.6;

const pseudoRandomFromSeed = (seed: number) => {
  const noise = Math.sin(seed) * 43758.5453;
  return noise - Math.floor(noise);
};

type WelcomeHalftoneParticleLayout = {
  particles: WelcomeHalftoneParticle[];
  halftoneSize: number;
  maxDistanceToCenter: number;
};

export const buildWelcomeHalftoneParticles = (
  dashes: readonly (readonly [number, number, number, number])[],
  canvasWidth: number,
  canvasHeight: number,
): WelcomeHalftoneParticleLayout => {
  const halftoneSize = Math.max(canvasWidth * 1.05, canvasHeight * 1.3);
  const viewboxToCanvasScale = halftoneSize / VIEWBOX_WIDTH;
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const maxDistanceToCenter =
    Math.hypot(VIEWBOX_CENTER_X, VIEWBOX_CENTER_Y) * viewboxToCanvasScale || 1;

  const particles = dashes.map(
    ([dashStartX, dashEndX, dashY, dashStrokeWidth], dashIndex) => {
      const targetX =
        canvasCenterX +
        ((dashStartX + dashEndX) / 2 - VIEWBOX_CENTER_X) * viewboxToCanvasScale;
      const targetY =
        canvasCenterY + (dashY - VIEWBOX_CENTER_Y) * viewboxToCanvasScale;
      const distanceToCenter = Math.hypot(
        targetX - canvasCenterX,
        targetY - canvasCenterY,
      );
      const scatterAngle = pseudoRandomFromSeed(dashIndex * 1.3) * TAU;
      const scatterRadius =
        halftoneSize * (0.35 + 0.5 * pseudoRandomFromSeed(dashIndex * 2.1));

      return {
        targetX,
        targetY,
        scatterStartX: canvasCenterX + Math.cos(scatterAngle) * scatterRadius,
        scatterStartY: canvasCenterY + Math.sin(scatterAngle) * scatterRadius,
        dashLength: Math.max(dashEndX - dashStartX, 0) * viewboxToCanvasScale,
        strokeWidth: Math.max(
          dashStrokeWidth * viewboxToCanvasScale,
          MINIMUM_STROKE_WIDTH,
        ),
        burstDirectionX:
          distanceToCenter > 0
            ? (targetX - canvasCenterX) / distanceToCenter
            : 0,
        burstDirectionY:
          distanceToCenter > 0
            ? (targetY - canvasCenterY) / distanceToCenter
            : -1,
        distanceToCenter,
        assembleDelaySeconds:
          ASSEMBLE_STAGGER_SECONDS * (distanceToCenter / maxDistanceToCenter) +
          ASSEMBLE_JITTER_SECONDS * pseudoRandomFromSeed(dashIndex * 3.7),
        driftPhase: pseudoRandomFromSeed(dashIndex * 5.1) * TAU,
        positionAtLeaveStartX: 0,
        positionAtLeaveStartY: 0,
        opacityAtLeaveStart: 0,
      };
    },
  );

  return { particles, halftoneSize, maxDistanceToCenter };
};
