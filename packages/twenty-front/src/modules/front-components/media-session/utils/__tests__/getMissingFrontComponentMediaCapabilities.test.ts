import { getMissingFrontComponentMediaCapabilities } from '@/front-components/media-session/utils/getMissingFrontComponentMediaCapabilities';

describe('getMissingFrontComponentMediaCapabilities', () => {
  it('asks only for the additional capability needed by the recording', () => {
    expect(
      getMissingFrontComponentMediaCapabilities({
        grantedCapabilities: ['microphone'],
        mediaTypes: ['audio', 'video'],
      }),
    ).toEqual(['camera']);
  });

  it('does not request camera access for an audio-only recording', () => {
    expect(
      getMissingFrontComponentMediaCapabilities({
        grantedCapabilities: [],
        mediaTypes: ['audio'],
      }),
    ).toEqual(['microphone']);
  });
});
