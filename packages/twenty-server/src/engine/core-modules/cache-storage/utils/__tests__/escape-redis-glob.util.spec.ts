import { escapeRedisGlob } from 'src/engine/core-modules/cache-storage/utils/escape-redis-glob.util';

describe('escapeRedisGlob', () => {
  it.each([
    ['', ''],
    ['{twenty-cache}:engine:workspace:', '{twenty-cache}:engine:workspace:'],
    ['{twenty[prod]}', '{twenty\\[prod\\]}'],
    ['{twenty*}', '{twenty\\*}'],
    ['{twenty?}', '{twenty\\?}'],
    ['{twenty\\prod}', '{twenty\\\\prod}'],
    ['{twenty]prod}', '{twenty\\]prod}'],
  ])('escapes %s as literal Redis glob text', (value, expected) => {
    expect(escapeRedisGlob(value)).toBe(expected);
  });
});
