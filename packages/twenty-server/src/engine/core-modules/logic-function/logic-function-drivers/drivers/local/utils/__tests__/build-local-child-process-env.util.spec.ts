import { buildLocalChildProcessEnv } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/build-local-child-process-env.util';

describe('buildLocalChildProcessEnv', () => {
  it('keeps runtime settings from the host and drops everything else', () => {
    expect(
      buildLocalChildProcessEnv({
        hostEnv: {
          PATH: '/usr/bin',
          TZ: 'UTC',
          NODE_EXTRA_CA_CERTS: '/certs/ca.pem',
          HTTPS_PROXY: 'http://proxy:3128',
          APP_SECRET: 'app-secret',
          PG_DATABASE_URL: 'postgres://user:password@db:5432/default',
        },
        functionEnv: {},
        temporaryDirectory: '/execution/tmp',
      }),
    ).toEqual({
      PATH: '/usr/bin',
      TZ: 'UTC',
      NODE_EXTRA_CA_CERTS: '/certs/ca.pem',
      HTTPS_PROXY: 'http://proxy:3128',
      TMPDIR: '/execution/tmp',
    });
  });

  it('lets function variables override host settings', () => {
    expect(
      buildLocalChildProcessEnv({
        hostEnv: { TZ: 'UTC' },
        functionEnv: { TZ: 'Europe/Paris', TWENTY_API_URL: 'http://api' },
        temporaryDirectory: '/execution/tmp',
      }),
    ).toEqual({
      TZ: 'Europe/Paris',
      TWENTY_API_URL: 'http://api',
      TMPDIR: '/execution/tmp',
    });
  });

  it('ignores NODE_OPTIONS and TMPDIR from function variables', () => {
    expect(
      buildLocalChildProcessEnv({
        hostEnv: { NODE_OPTIONS: '--import tsx' },
        functionEnv: { NODE_OPTIONS: '--inspect', TMPDIR: '/tmp' },
        temporaryDirectory: '/execution/tmp',
      }),
    ).toEqual({ TMPDIR: '/execution/tmp' });
  });
});
