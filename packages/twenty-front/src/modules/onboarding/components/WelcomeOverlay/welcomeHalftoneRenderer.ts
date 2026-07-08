const TAU = Math.PI * 2;
const VIEWBOX_WIDTH = 297.037;
const VIEWBOX_CENTER_X = 148.5;
const VIEWBOX_CENTER_Y = 119.5;

const DASH_DURATION_SECONDS = 0.62;
const ASSEMBLE_STAGGER_SECONDS = 0.18;
const ASSEMBLE_JITTER_SECONDS = 0.12;
const BURST_DURATION_SECONDS = 0.75;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, ratio: number) =>
  from + (to - from) * ratio;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const smootherStep = (t: number) => t * t * (3 - 2 * t);

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed) * 43758.5453;
  return value - Math.floor(value);
};

type WelcomeHalftoneParticle = {
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  length: number;
  strokeWidth: number;
  directionX: number;
  directionY: number;
  distanceToCenter: number;
  delaySeconds: number;
  phase: number;
  leaveX: number;
  leaveY: number;
  leaveAlpha: number;
};

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

  let width = options.width;
  let height = options.height;
  let devicePixelRatio = options.devicePixelRatio;

  let particles: WelcomeHalftoneParticle[] = [];
  let halftoneSize = 0;
  let centerX = 0;
  let centerY = 0;
  let maxDistanceToCenter = 1;

  let startTimeMs: number | null = null;
  let leaveTimeSeconds: number | null = null;
  let leaveRequested = false;
  let frameHandle = 0;

  const supportsAnimationFrame = typeof requestAnimationFrame === 'function';

  const requestFrame = (callback: (time: number) => void) => {
    frameHandle = supportsAnimationFrame
      ? requestAnimationFrame(callback)
      : (setTimeout(
          () => callback(performance.now()),
          16,
        ) as unknown as number);
  };

  const cancelFrame = () => {
    if (supportsAnimationFrame) {
      cancelAnimationFrame(frameHandle);
    } else {
      clearTimeout(frameHandle);
    }
  };

  const build = () => {
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.lineCap = 'round';
    halftoneSize = Math.max(width * 1.05, height * 1.3);
    const scale = halftoneSize / VIEWBOX_WIDTH;
    centerX = width / 2;
    centerY = height / 2;
    maxDistanceToCenter =
      Math.hypot(VIEWBOX_CENTER_X, VIEWBOX_CENTER_Y) * scale || 1;

    particles = dashes.map(([x1, x2, y, strokeWidth], index) => {
      const targetX = centerX + ((x1 + x2) / 2 - VIEWBOX_CENTER_X) * scale;
      const targetY = centerY + (y - VIEWBOX_CENTER_Y) * scale;
      const distanceToCenter = Math.hypot(targetX - centerX, targetY - centerY);
      const scatterAngle = pseudoRandom(index * 1.3) * TAU;
      const scatterRadius =
        halftoneSize * (0.35 + 0.5 * pseudoRandom(index * 2.1));

      return {
        targetX,
        targetY,
        startX: centerX + Math.cos(scatterAngle) * scatterRadius,
        startY: centerY + Math.sin(scatterAngle) * scatterRadius,
        length: Math.max(x2 - x1, 0) * scale,
        strokeWidth: Math.max(strokeWidth * scale, 0.6),
        directionX:
          distanceToCenter > 0 ? (targetX - centerX) / distanceToCenter : 0,
        directionY:
          distanceToCenter > 0 ? (targetY - centerY) / distanceToCenter : -1,
        distanceToCenter,
        delaySeconds:
          ASSEMBLE_STAGGER_SECONDS * (distanceToCenter / maxDistanceToCenter) +
          ASSEMBLE_JITTER_SECONDS * pseudoRandom(index * 3.7),
        phase: pseudoRandom(index * 5.1) * TAU,
        leaveX: 0,
        leaveY: 0,
        leaveAlpha: 0,
      };
    });
  };

  const computeAssembleState = (
    particle: WelcomeHalftoneParticle,
    seconds: number,
  ) => {
    const progress = easeOutExpo(
      clamp01((seconds - particle.delaySeconds) / DASH_DURATION_SECONDS),
    );
    let x = lerp(particle.startX, particle.targetX, progress);
    let y = lerp(particle.startY, particle.targetY, progress);
    const settled = clamp01(
      (seconds - (particle.delaySeconds + DASH_DURATION_SECONDS)) / 0.6,
    );
    x += Math.sin(seconds * 1.6 + particle.phase) * settled * 1.2;
    y += Math.cos(seconds * 1.4 + particle.phase) * settled * 0.8;
    return { x, y, alpha: progress };
  };

  const draw = (timeMs: number) => {
    if (startTimeMs === null) {
      startTimeMs = timeMs;
    }
    const elapsedSeconds = (timeMs - startTimeMs) / 1000;

    if (leaveRequested && leaveTimeSeconds === null) {
      leaveTimeSeconds = elapsedSeconds;
      for (const particle of particles) {
        if (reducedMotion) {
          particle.leaveX = particle.targetX;
          particle.leaveY = particle.targetY;
          particle.leaveAlpha = 1;
        } else {
          const state = computeAssembleState(particle, elapsedSeconds);
          particle.leaveX = state.x;
          particle.leaveY = state.y;
          particle.leaveAlpha = state.alpha;
        }
      }
    }

    const burst =
      leaveTimeSeconds !== null
        ? clamp01((elapsedSeconds - leaveTimeSeconds) / BURST_DURATION_SECONDS)
        : 0;
    const isLeaving = leaveTimeSeconds !== null;

    context.clearRect(0, 0, width, height);

    const sweepPosition = ((elapsedSeconds * 0.5) % 1.3) / 1.3;
    const sweepActive = !reducedMotion && !isLeaving;
    const spanInverse = 1 / (width + height);
    let currentStroke = '';

    for (const particle of particles) {
      let x: number;
      let y: number;
      let alpha: number;
      let length = particle.length;
      let directionalX = 1;
      let directionalY = 0;

      if (reducedMotion) {
        x = particle.targetX;
        y = particle.targetY;
        alpha = isLeaving ? 1 - burst : 1;
      } else if (!isLeaving) {
        const state = computeAssembleState(particle, elapsedSeconds);
        x = state.x;
        y = state.y;
        alpha = state.alpha;
      } else {
        const eased = smootherStep(burst);
        const push =
          eased *
          halftoneSize *
          1.1 *
          (0.6 + 0.8 * (particle.distanceToCenter / maxDistanceToCenter));
        x = particle.leaveX + particle.directionX * push;
        y = particle.leaveY + particle.directionY * push;
        alpha = particle.leaveAlpha * (1 - easeOut(clamp01(burst / 0.85)));
        length = particle.length + push * 0.12 * burst;
        directionalX = particle.directionX;
        directionalY = particle.directionY;
      }

      if (alpha <= 0.01) {
        continue;
      }

      const isInSweep =
        sweepActive && Math.abs((x + y) * spanInverse - sweepPosition) < 0.028;
      const stroke = isInSweep ? highlightColor : baseColor;
      if (stroke !== currentStroke) {
        context.strokeStyle = stroke;
        currentStroke = stroke;
      }

      context.globalAlpha = alpha;
      context.lineWidth = particle.strokeWidth;
      context.beginPath();
      const halfX = (directionalX * length) / 2;
      const halfY = (directionalY * length) / 2;
      context.moveTo(x - halfX, y - halfY);
      context.lineTo(x + halfX, y + halfY);
      context.stroke();
    }

    context.globalAlpha = 1;
    requestFrame(draw);
  };

  build();
  requestFrame(draw);

  return {
    leave: () => {
      leaveRequested = true;
    },
    resize: (
      nextWidth: number,
      nextHeight: number,
      nextDevicePixelRatio: number,
    ) => {
      width = nextWidth;
      height = nextHeight;
      devicePixelRatio = nextDevicePixelRatio;
      build();
    },
    destroy: () => {
      cancelFrame();
    },
  };
};
