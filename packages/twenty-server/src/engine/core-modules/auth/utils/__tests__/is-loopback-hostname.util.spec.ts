import { isLoopbackHostname } from 'src/engine/core-modules/auth/utils/is-loopback-hostname.util';

describe('isLoopbackHostname', () => {
  it.each([
    'localhost',
    'localhost.',
    '127.0.0.1',
    '127.1.2.3',
    '[::1]',
    '[::ffff:7f00:1]',
  ])('treats %s as loopback', (hostname) => {
    expect(isLoopbackHostname(hostname)).toBe(true);
  });

  it.each([
    'example.com',
    'localhost.example.com',
    '128.0.0.1',
    '[::2]',
    '[::ffff:a00:1]',
  ])('does not treat %s as loopback', (hostname) => {
    expect(isLoopbackHostname(hostname)).toBe(false);
  });
});
