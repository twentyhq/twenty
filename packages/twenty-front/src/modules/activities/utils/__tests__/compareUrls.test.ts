import { compareUrls } from '@/activities/utils/compareUrls';

describe('compareUrls', () => {
  it('should return true if the two URLs are the same except for the token segment', () => {
    const firstToken = 'ugudgugugxsqv';
    const secondToken = 'yugguzvdhvyuzede';
    const urlA = `https://exemple.com/files/attachment/${firstToken}/test.txt`;
    const urlB = `https://exemple.com/files/attachment/${secondToken}/test.txt`;
    const result = compareUrls(urlA, urlB);
    expect(result).toEqual(true);
  });

  it('should return true if the two URLs are exactly the same', () => {
    const urlA = `https://exemple.com/files/images/test.txt`;
    const urlB = `https://exemple.com/files/images/test.txt`;
    const result = compareUrls(urlA, urlB);
    expect(result).toEqual(true);
  });

  it('should return false if filenames are different in the same domain', () => {
    const urlA = `https://exemple.com/files/images/test1.txt`;
    const urlB = `https://exemple.com/files/images/test.txt`;
    const result = compareUrls(urlA, urlB);
    expect(result).toEqual(false);
  });

  it('should return false if the domains are different', () => {
    const urlA = `https://exemple1.com/files/images/test1.txt`;
    const urlB = `https://exemple.com/files/images/test.txt`;
    const result = compareUrls(urlA, urlB);
    expect(result).toEqual(false);
  });
});
