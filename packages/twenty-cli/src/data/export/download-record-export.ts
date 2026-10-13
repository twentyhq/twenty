import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createHttpStatusError } from '@/transport/create-http-status-error';
import {
  createRedirectError,
  toTransportError,
} from '@/transport/create-target-fetch';
import { fetchWithProxy } from '@/transport/fetch-with-proxy';
import { resolveRequestUrl } from '@/transport/resolve-request-url';

const DOWNLOAD_TIMEOUT_MILLISECONDS = 15 * 60 * 1000;

export const downloadRecordExport = async ({
  id,
  downloadPath,
  target,
  signal,
  save,
}: {
  id: string;
  downloadPath: string;
  target: ResolvedTarget;
  signal: AbortSignal;
  save: (body: ReadableStream<Uint8Array>) => Promise<number>;
}) => {
  if (
    !downloadPath.startsWith(`/file/record-export/${id}?token=`) ||
    !/^\/file\/record-export\/[0-9a-f-]+\?token=[A-Za-z0-9._-]+$/i.test(
      downloadPath,
    )
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The server returned an invalid export download path.',
    });
  }
  const url = resolveRequestUrl({ apiUrl: target.apiUrl, path: downloadPath });
  const downloadSignal = AbortSignal.any([
    signal,
    AbortSignal.timeout(DOWNLOAD_TIMEOUT_MILLISECONDS),
  ]);
  let response: Response | undefined;
  try {
    response = await fetchWithProxy(
      url,
      {
        headers: {
          Authorization: `Bearer ${target.bearerToken}`,
          Accept: 'text/csv',
        },
        redirect: 'manual',
        signal: downloadSignal,
      },
      DOWNLOAD_TIMEOUT_MILLISECONDS,
    );
    if (response.status >= 300 && response.status < 400) {
      throw createRedirectError(response, url);
    }
    if (!response.ok) {
      throw createHttpStatusError({
        status: response.status,
        headers: response.headers,
        body: undefined,
        target,
      });
    }
    if (
      !isDefined(response.body) ||
      response.headers
        .get('content-type')
        ?.split(';')[0]
        .trim()
        .toLowerCase() !== 'text/csv'
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The server did not return a CSV file.',
      });
    }
    return await save(response.body);
  } catch (error) {
    if (error instanceof CliError || signal.aborted) {
      throw error;
    }
    const failure = toTransportError({
      error,
      signal,
      url,
      timeoutMilliseconds: DOWNLOAD_TIMEOUT_MILLISECONDS,
    });
    if (failure instanceof CliError) {
      throw new CliError({
        code: failure.code,
        message: failure.message,
        hint: 'Run the export again. Interrupted downloads cannot be resumed.',
      });
    }
    throw failure;
  } finally {
    await response?.body?.cancel().catch(() => undefined);
  }
};
