import { makePageview } from './analytics.utils';

describe('makePageview', () => {
  it('should create a pageview with default properties when none are provided', () => {
    const result = makePageview('test-page');

    expect(result.name).toBe('test-page');
    expect(result.type).toBe('page');
    expect(result.properties).toEqual({
      href: '',
      locale: '',
      pathname: '',
      referrer: '',
      sessionId: '',
      timeZone: '',
      userAgent: '',
    });
    expect(result.timestamp).toBeDefined();
    expect(result.version).toBe('1');
  });

  it('should create a pageview with provided properties and fill in defaults for missing ones', () => {
    const providedProperties = {
      href: 'https://example.com',
      sessionId: 'test-session-id',
    };

    const result = makePageview('test-page', providedProperties);

    expect(result.name).toBe('test-page');
    expect(result.type).toBe('page');
    expect(result.properties).toEqual({
      href: 'https://example.com',
      locale: '',
      pathname: '',
      referrer: '',
      sessionId: 'test-session-id',
      timeZone: '',
      userAgent: '',
    });
    expect(result.timestamp).toBeDefined();
    expect(result.version).toBe('1');
  });

  it('should handle empty properties object', () => {
    const result = makePageview('test-page', {});

    expect(result.name).toBe('test-page');
    expect(result.type).toBe('page');
    expect(result.properties.sessionId).toBe('');
    expect(result.properties.href).toBe('');
  });
});
