import { isUuidShaped } from 'src/engine/core-modules/server-route-trigger/utils/is-uuid-shaped.util';

describe('isUuidShaped', () => {
  it.each([
    '72b52885-e1ba-419f-8e2e-052700f2c9f2',
    '0192f5b8-7c3d-7a10-9e4b-2f6d8c1a3b5e',
    '20202020-b3a4-0ef2-c94b-c3f5e8a1d6b7',
    '00000000-0000-0000-0000-000000000000',
  ])('accepts %s', (value) => {
    expect(isUuidShaped(value)).toBe(true);
  });

  it.each(['not-a-uuid', '72b52885e1ba419f8e2e052700f2c9f2', ''])(
    'rejects %s',
    (value) => {
      expect(isUuidShaped(value)).toBe(false);
    },
  );
});
