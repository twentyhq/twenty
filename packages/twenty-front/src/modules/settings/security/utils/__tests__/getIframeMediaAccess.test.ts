import { getIframeMediaAccess } from '@/settings/security/utils/getIframeMediaAccess';

describe('getIframeMediaAccess', () => {
  it.each([
    { microphone: true, camera: true, expected: 'microphoneAndCamera' },
    { microphone: true, camera: false, expected: 'microphone' },
    { microphone: false, camera: true, expected: 'camera' },
  ])(
    'maps microphone $microphone and camera $camera to $expected',
    ({ microphone, camera, expected }) => {
      expect(getIframeMediaAccess({ microphone, camera })).toBe(expected);
    },
  );
});
