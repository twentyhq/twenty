import path from 'path';

export const getLastPathFolder = (pathString: string) =>
  path.basename(pathString);
