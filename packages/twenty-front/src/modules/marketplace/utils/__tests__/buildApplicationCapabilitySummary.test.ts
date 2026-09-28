import { buildApplicationCapabilitySummary } from '@/marketplace/utils/buildApplicationCapabilitySummary';

describe('buildApplicationCapabilitySummary', () => {
  it('shows microphone and camera access during installation', () => {
    expect(
      buildApplicationCapabilitySummary(['microphone', 'camera']).map(
        ({ label }) => label,
      ),
    ).toEqual(['Use your microphone', 'Use your camera']);
  });
});
