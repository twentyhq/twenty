import { getActiveApplicationIframeMediaPermissions } from 'src/engine/core-modules/frontend/utils/get-active-application-iframe-media-permissions.util';

describe('getActiveApplicationIframeMediaPermissions', () => {
  it('excludes deleted applications without adding their origins or device grants', () => {
    const activePermission = {
      origin: 'https://phone.example.com',
      microphone: true,
      camera: false,
    };
    const deletedAt = new Date('2026-01-01T00:00:00.000Z');

    expect(
      getActiveApplicationIframeMediaPermissions([
        {
          deletedAt: null,
          grantedIframeMediaPermissions: [activePermission],
        },
        {
          deletedAt,
          grantedIframeMediaPermissions: [
            { ...activePermission, microphone: false, camera: true },
          ],
        },
        {
          deletedAt,
          grantedIframeMediaPermissions: [
            {
              origin: 'https://deleted.example.com',
              microphone: true,
              camera: true,
            },
          ],
        },
        undefined,
      ]),
    ).toEqual([activePermission]);
  });
});
