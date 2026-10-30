import { isArray, isString } from '@sniptt/guards';
import maxSatisfying from 'semver/ranges/max-satisfying';
import valid from 'semver/functions/valid';
import validRange from 'semver/ranges/valid';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { getLocalEngineRange } from '@/local/get-local-engine-range';
import { getLocalImage } from '@/local/get-local-image';
import { LOCAL_IMAGE_REPOSITORY } from '@/local/get-local-environment';
import { CliError } from '@/output/cli-error';
import { fetchWithProxy } from '@/transport/fetch-with-proxy';
import { readBoundedBody } from '@/transport/read-bounded-body';

export const resolveLocalImage = async ({
  version,
  signal,
}: {
  version: string | undefined;
  signal: AbortSignal;
}) => {
  if (isDefined(version)) {
    return getLocalImage(version);
  }

  const range = getLocalEngineRange();

  if (!isDefined(range)) {
    return getLocalImage('latest');
  }

  if (!validRange(range)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      message: 'The app engines.twenty range is invalid.',
      hint: 'Fix engines.twenty or pass a version explicitly.',
    });
  }

  const versions: string[] = [];
  const lookupSignal = AbortSignal.any([signal, AbortSignal.timeout(15_000)]);

  try {
    for (let page = 1; page <= 20; page++) {
      const response = await fetchWithProxy(
        `https://hub.docker.com/v2/repositories/${LOCAL_IMAGE_REPOSITORY}/tags?page_size=100&page=${page}`,
        { signal: lookupSignal },
      );
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error('Image registry request failed');
      }
      const body: unknown = JSON.parse(
        Buffer.from(
          await readBoundedBody(response, 2 * 1024 * 1024),
        ).toString(),
      );
      if (!isPlainObject(body) || !isArray(body.results)) {
        throw new Error('Invalid image registry response');
      }
      for (const entry of body.results) {
        if (isPlainObject(entry) && isString(entry.name) && valid(entry.name)) {
          versions.push(entry.name);
        }
      }
      if (!isDefined(body.next)) {
        const match = maxSatisfying(versions, range);
        if (isDefined(match)) {
          return getLocalImage(match);
        }
        throw new Error('No published image matches engines.twenty');
      }
    }
    throw new Error('Image registry listing exceeded 2000 tags');
  } catch {
    signal.throwIfAborted();
    throw new CliError({
      code: 'LOCAL_ENVIRONMENT_FAILED',
      message: `Could not select a published Twenty image matching ${range}.`,
      hint: 'Check the range and your connection, or pass a version explicitly.',
    });
  }
};
