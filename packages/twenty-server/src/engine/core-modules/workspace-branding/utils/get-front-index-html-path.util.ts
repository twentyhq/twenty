import { join } from 'path';

import { getFrontDistPath } from './get-front-dist-path.util';

export const getFrontIndexHtmlPath = (): string | null => {
  const frontDistPath = getFrontDistPath();

  if (frontDistPath === null) {
    return null;
  }

  return join(frontDistPath, 'index.html');
};
