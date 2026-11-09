import { describeHttpEgressUrl } from 'src/engine/core-modules/http-egress/utils/describe-http-egress-url.util';

describe('describeHttpEgressUrl', () => {
  it('should return the host, explicit port and a path hash', () => {
    const description = describeHttpEgressUrl(
      'http://api.example.com:8080/v1/items?token=secret',
    );

    expect(description).toMatchObject({
      host: 'api.example.com',
      port: '8080',
    });
    expect(description.pathHash).toMatch(/^[0-9a-f]{16}$/);
  });

  it('should fill in the default port for the protocol', () => {
    expect(describeHttpEgressUrl('https://api.example.com/').port).toBe('443');
    expect(describeHttpEgressUrl('http://api.example.com/').port).toBe('80');
  });

  it('should not include the path or query string in clear', () => {
    const description = describeHttpEgressUrl(
      'https://hooks.example.com/services/T000/B000/secret?key=value',
    );

    expect(JSON.stringify(description)).not.toContain('secret');
    expect(JSON.stringify(description)).not.toContain('value');
  });

  it('should hash only the path, so query strings do not change it', () => {
    expect(
      describeHttpEgressUrl('https://api.example.com/items?page=1').pathHash,
    ).toBe(
      describeHttpEgressUrl('https://api.example.com/items?page=2').pathHash,
    );
  });

  it.each([undefined, 42, 'not a url'])(
    'should return nothing for %p',
    (url) => {
      expect(describeHttpEgressUrl(url)).toEqual({});
    },
  );
});
