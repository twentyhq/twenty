import { getFrontComponentMediaCapabilityDenial } from '@/front-components/media-session/utils/getFrontComponentMediaCapabilityDenial';

describe('getFrontComponentMediaCapabilityDenial', () => {
  it('denies audio without the microphone capability', () => {
    expect(
      getFrontComponentMediaCapabilityDenial({
        grantedCapabilities: [],
        mediaTypes: ['audio'],
      }),
    ).toMatchObject({ errorName: 'NotAllowedError' });
  });

  it('denies video without the camera capability', () => {
    expect(
      getFrontComponentMediaCapabilityDenial({
        grantedCapabilities: [],
        mediaTypes: ['video'],
      }),
    ).toMatchObject({ errorName: 'NotAllowedError' });
  });

  it('keeps microphone and camera capabilities separate', () => {
    expect(
      getFrontComponentMediaCapabilityDenial({
        grantedCapabilities: ['microphone'],
        mediaTypes: ['audio', 'video'],
      }),
    ).toMatchObject({ errorMessage: expect.stringContaining('camera') });

    expect(
      getFrontComponentMediaCapabilityDenial({
        grantedCapabilities: ['camera'],
        mediaTypes: ['audio', 'video'],
      }),
    ).toMatchObject({ errorMessage: expect.stringContaining('microphone') });
  });

  it('allows only the media types declared by the application', () => {
    expect(
      getFrontComponentMediaCapabilityDenial({
        grantedCapabilities: ['microphone'],
        mediaTypes: ['audio'],
      }),
    ).toBeNull();

    expect(
      getFrontComponentMediaCapabilityDenial({
        grantedCapabilities: ['camera'],
        mediaTypes: ['video'],
      }),
    ).toBeNull();
  });

  it('does not share one application capability with another application', () => {
    const applicationAGrantedCapabilities = ['microphone'];
    const applicationBGrantedCapabilities: string[] = [];

    expect(
      getFrontComponentMediaCapabilityDenial({
        grantedCapabilities: applicationAGrantedCapabilities,
        mediaTypes: ['audio'],
      }),
    ).toBeNull();
    expect(
      getFrontComponentMediaCapabilityDenial({
        grantedCapabilities: applicationBGrantedCapabilities,
        mediaTypes: ['audio'],
      }),
    ).toMatchObject({ errorName: 'NotAllowedError' });
  });
});
