import { getImageAbsoluteURI } from '../getImageAbsoluteURI';

describe('getImageAbsoluteURI', () => {
  it('should return null if imageUrl is null', () => {
    const imageUrl = null;
    const result = getImageAbsoluteURI(imageUrl);
    expect(result).toBeNull();
  });

  it('should return absolute url if the imageUrl is an absolute url', () => {
    const imageUrl = 'https://XXX';
    const result = getImageAbsoluteURI(imageUrl);
    expect(result).toBe(imageUrl);
  });

  it('should return fully formed url if imageUrl is a relative url', () => {
    const imageUrl = 'XXX';
    const result = getImageAbsoluteURI(imageUrl);
    expect(result).toBe('http://localhost:3000/files/XXX');
  });
});
