import { extname } from 'path';

export const hasAllowedExtension = ({
  filePath,
  allowedExtensions,
}: {
  filePath: string;
  allowedExtensions: Readonly<Record<string, true>>;
}): boolean => {
  const ext = extname(filePath).toLowerCase();

  return allowedExtensions[ext] === true;
};
