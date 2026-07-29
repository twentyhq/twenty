import { buildWelcomeHalftoneParticles } from '@/onboarding/components/WelcomeOverlay/buildWelcomeHalftoneParticles';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 832;
const VIEWBOX_WIDTH = 297.037;
const MINIMUM_STROKE_WIDTH = 0.6;
const VIEWBOX_TO_CANVAS_SCALE =
  Math.max(CANVAS_WIDTH * 1.05, CANVAS_HEIGHT * 1.3) / VIEWBOX_WIDTH;

describe('buildWelcomeHalftoneParticles', () => {
  it('should elongate zero length dashes to the halftone aspect ratio', () => {
    const { particles } = buildWelcomeHalftoneParticles(
      [[148.5, 148.5, 119.5, 2]],
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );

    expect(particles[0].dashLength).toBeCloseTo(
      2 * VIEWBOX_TO_CANVAS_SCALE * 1.452,
    );
    expect(particles[0].strokeWidth).toBeCloseTo(2 * VIEWBOX_TO_CANVAS_SCALE);
  });

  it('should keep the dash length when the source dash is longer than the aspect ratio', () => {
    const { particles } = buildWelcomeHalftoneParticles(
      [[148.5, 158.5, 119.5, 2]],
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );

    expect(particles[0].dashLength).toBeCloseTo(10 * VIEWBOX_TO_CANVAS_SCALE);
  });

  it('should keep the dash length proportional to the source stroke width when the minimum stroke width applies', () => {
    const smallCanvasWidth = 600;
    const smallCanvasHeight = 500;
    const smallCanvasScale =
      Math.max(smallCanvasWidth * 1.05, smallCanvasHeight * 1.3) /
      VIEWBOX_WIDTH;
    const fainterSourceStrokeWidth = 0.19;
    const denserSourceStrokeWidth = 0.25;

    const { particles } = buildWelcomeHalftoneParticles(
      [
        [148.5, 148.5, 119.5, fainterSourceStrokeWidth],
        [148.5, 148.5, 119.5, denserSourceStrokeWidth],
      ],
      smallCanvasWidth,
      smallCanvasHeight,
    );

    expect(particles[0].strokeWidth).toBe(MINIMUM_STROKE_WIDTH);
    expect(particles[1].strokeWidth).toBe(MINIMUM_STROKE_WIDTH);
    expect(particles[0].dashLength).toBeCloseTo(
      fainterSourceStrokeWidth * smallCanvasScale * 1.452,
    );
    expect(particles[0].dashLength).toBeLessThan(particles[1].dashLength);
  });
});
