import { upsertIframeMediaPermission } from 'src/engine/core-modules/workspace/utils/upsert-iframe-media-permission.util';

const PHONE = {
  origin: 'https://phone.example.com',
  microphone: true,
  camera: false,
};
const VIDEO = {
  origin: 'https://video.example.com',
  microphone: true,
  camera: true,
};

describe('upsertIframeMediaPermission', () => {
  it('appends a newly approved origin', () => {
    expect(
      upsertIframeMediaPermission({ permissions: [PHONE], permission: VIDEO }),
    ).toEqual([PHONE, VIDEO]);
  });

  it('updates an existing origin in place', () => {
    expect(
      upsertIframeMediaPermission({
        permissions: [PHONE, VIDEO],
        permission: { ...PHONE, camera: true },
      }),
    ).toEqual([{ ...PHONE, camera: true }, VIDEO]);
  });

  it('removes an origin when every capability is disabled', () => {
    expect(
      upsertIframeMediaPermission({
        permissions: [PHONE, VIDEO],
        permission: { ...PHONE, microphone: false },
      }),
    ).toEqual([VIDEO]);
  });

  it('ignores an unknown origin without capabilities', () => {
    expect(
      upsertIframeMediaPermission({
        permissions: [PHONE],
        permission: { ...VIDEO, microphone: false, camera: false },
      }),
    ).toEqual([PHONE]);
  });
});
