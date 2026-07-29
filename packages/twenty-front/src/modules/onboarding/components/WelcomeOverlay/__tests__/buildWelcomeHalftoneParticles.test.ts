import { buildWelcomeHalftoneParticles } from '@/onboarding/components/WelcomeOverlay/buildWelcomeHalftoneParticles';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 832;
const VIEWBOX_WIDTH = 297.037;
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
});
