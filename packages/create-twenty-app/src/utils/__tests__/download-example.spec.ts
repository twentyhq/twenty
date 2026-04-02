import { isUrl, parseGitHubUrl } from '@/utils/download-example';

describe('isUrl', () => {
  it('should return true for https URLs', () => {
    expect(isUrl('https://github.com/user/repo')).toBe(true);
  });

  it('should return true for http URLs', () => {
    expect(isUrl('http://github.com/user/repo')).toBe(true);
  });

  it('should return false for example names', () => {
    expect(isUrl('hello-world')).toBe(false);
    expect(isUrl('my-example')).toBe(false);
  });
});

describe('parseGitHubUrl', () => {
  it('should parse a simple repo URL', () => {
    const result = parseGitHubUrl('https://github.com/user/repo');

    expect(result).toEqual({
      owner: 'user',
      repo: 'repo',
      ref: 'main',
      path: '',
    });
  });

  it('should parse a URL with branch', () => {
    const result = parseGitHubUrl('https://github.com/user/repo/tree/develop');

    expect(result).toEqual({
      owner: 'user',
      repo: 'repo',
      ref: 'develop',
      path: '',
    });
  });

  it('should parse a URL with branch and path', () => {
    const result = parseGitHubUrl(
      'https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/examples/hello-world',
    );

    expect(result).toEqual({
      owner: 'twentyhq',
      repo: 'twenty',
      ref: 'main',
      path: 'packages/twenty-apps/examples/hello-world',
    });
  });

  it('should handle .git suffix', () => {
    const result = parseGitHubUrl('https://github.com/user/repo.git');

    expect(result).toEqual({
      owner: 'user',
      repo: 'repo',
      ref: 'main',
      path: '',
    });
  });

  it('should throw on invalid URL', () => {
    expect(() => parseGitHubUrl('https://gitlab.com/user/repo')).toThrow(
      'Invalid GitHub URL',
    );
  });

  it('should throw on malformed URL', () => {
    expect(() => parseGitHubUrl('not-a-url')).toThrow('Invalid GitHub URL');
  });
});
