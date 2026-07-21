import { isTextContentType } from '../isTextContentType';

describe('isTextContentType', () => {
  it('should accept text types', () => {
    expect(isTextContentType('text/plain')).toBe(true);
    expect(isTextContentType('text/html')).toBe(true);
  });

  it('should accept form urlencoded and graphql types', () => {
    expect(isTextContentType('application/x-www-form-urlencoded')).toBe(true);
    expect(isTextContentType('application/graphql')).toBe(true);
  });

  it('should accept json suffixed types', () => {
    expect(isTextContentType('application/json')).toBe(true);
    expect(isTextContentType('application/vnd.api+json')).toBe(true);
  });

  it('should accept xml suffixed types', () => {
    expect(isTextContentType('application/xml')).toBe(true);
    expect(isTextContentType('image/svg+xml')).toBe(true);
  });

  it('should ignore parameters such as charset when matching', () => {
    expect(isTextContentType('application/json; charset=utf-8')).toBe(true);
    expect(isTextContentType('text/plain;charset=UTF-8')).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(isTextContentType('Application/JSON')).toBe(true);
  });

  it('should reject binary content types', () => {
    expect(isTextContentType('multipart/form-data; boundary=x')).toBe(false);
    expect(isTextContentType('application/octet-stream')).toBe(false);
    expect(isTextContentType('image/png')).toBe(false);
  });
});
