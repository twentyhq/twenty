import { getImageAbsoluteURIOrBase64 } from '../getImageAbsoluteURIOrBase64';

describe('getImageAbsoluteURIOrBase64', () => {
  it('should return null if imageUrl is null', () => {
    const imageUrl = null;
    const result = getImageAbsoluteURIOrBase64(imageUrl);
    expect(result).toBeNull();
  });

  it('shoud return base64 encoded string if prefixed with data', () => {
    const imageUrl = 'data:XXX';
    const result = getImageAbsoluteURIOrBase64(imageUrl);
    expect(result).toBe(imageUrl);
  });

  it('shoud return absolute url if the imageUrl is an absolute url', () => {
    const imageUrl = 'https://XXX';
    const result = getImageAbsoluteURIOrBase64(imageUrl);
    expect(result).toBe(imageUrl);
  });

  it('should return fully formed url if imageUrl is a relative url', () => {
    const imageUrl = 'XXX';
    const result = getImageAbsoluteURIOrBase64(imageUrl);
    expect(result).toBe('http://localhost:3000/files/XXX');
  });
});
