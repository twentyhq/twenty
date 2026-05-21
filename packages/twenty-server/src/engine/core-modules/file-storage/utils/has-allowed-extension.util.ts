import { extname } from 'path';

export const hasAllowedExtension = (
  filePath: string,
  allowedExtensions: Readonly<Record<string, true>>,
): boolean => {
  const ext = extname(filePath).toLowerCase();

  return ext in allowedExtensions;
};
