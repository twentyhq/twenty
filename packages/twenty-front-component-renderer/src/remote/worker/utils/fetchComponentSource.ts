import { isDefined } from 'twenty-shared/utils';

import {
  isFingerprintedComponentUrl,
  openComponentSourceCache,
  readComponentSourceFromCache,
  writeComponentSourceToCache,
} from '@/remote/worker/utils/componentSourceCache';
import { fetchComponentSourceFromNetwork } from '@/remote/worker/utils/fetchComponentSourceFromNetwork';

export const fetchComponentSource = async ({
  url,
  headers,
}: {
  url: string;
  headers?: Record<string, string>;
}): Promise<string> => {
  const cache = isFingerprintedComponentUrl({ url })
    ? await openComponentSourceCache()
    : undefined;

  if (isDefined(cache)) {
    const cachedSource = await readComponentSourceFromCache({ cache, url });

    if (isDefined(cachedSource)) {
      return cachedSource;
    }
  }

  const source = await fetchComponentSourceFromNetwork({ url, headers });

  if (isDefined(cache)) {
    writeComponentSourceToCache({ cache, url, source });
  }

  return source;
};
