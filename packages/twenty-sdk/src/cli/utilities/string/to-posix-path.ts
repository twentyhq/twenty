// path.relative() emits backslash separators on Windows; callers need forward slashes
export const toPosixPath = (value: string): string =>
  value.split('\\').join('/');
