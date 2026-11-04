import { getPendingApplicationIframeMediaPermissions } from '@/settings/applications/utils/getPendingApplicationIframeMediaPermissions';

describe('getPendingApplicationIframeMediaPermissions', () => {
  it('includes new origins and additional devices without repeating existing grants', () => {
    expect(
      getPendingApplicationIframeMediaPermissions({
        requestedPermissions: [
          {
            origin: 'https://phone.example.com',
            microphone: true,
            camera: true,
          },
          {
            origin: 'https://video.example.com',
            microphone: true,
            camera: true,
          },
        ],
        grantedPermissions: [
          {
            origin: 'https://phone.example.com',
            microphone: true,
            camera: false,
          },
          {
            origin: 'https://removed.example.com',
            microphone: true,
            camera: true,
          },
        ],
      }),
    ).toEqual([
      {
        origin: 'https://phone.example.com',
        microphone: false,
        camera: true,
      },
      {
        origin: 'https://video.example.com',
        microphone: true,
        camera: true,
      },
    ]);
  });

  it('has no pending permissions when all requested devices are already granted', () => {
    const permission = {
      origin: 'https://phone.example.com',
      microphone: true,
      camera: false,
    };

    expect(
      getPendingApplicationIframeMediaPermissions({
        requestedPermissions: [permission],
        grantedPermissions: [permission],
      }),
    ).toEqual([]);
  });
});
