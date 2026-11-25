import { buildApplicationIframeMediaPermissionSummary } from '@/marketplace/utils/buildApplicationIframeMediaPermissionSummary';

describe('buildApplicationIframeMediaPermissionSummary', () => {
  it('shows the embedded websites and the media they can use during installation', () => {
    expect(
      buildApplicationIframeMediaPermissionSummary([
        {
          origin: 'https://phone.example.com',
          microphone: true,
          camera: false,
        },
        {
          origin: 'https://photo.example.com',
          microphone: false,
          camera: true,
        },
        { origin: 'https://video.example.com', microphone: true, camera: true },
      ]).map(({ label }) => label),
    ).toEqual([
      'Let phone.example.com use your microphone',
      'Let photo.example.com use your camera',
      'Let video.example.com use your microphone and camera',
    ]);
  });
});
