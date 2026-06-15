import { isDefined } from 'twenty-shared/utils';

import {
  type ReadFrontComponentFileFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

/**
 * Read the bytes of a file the user picked or dropped inside this front-component.
 *
 * The Web Worker sandbox only ever receives file metadata (name/size/type), never
 * the bytes — so pass the `token` from `event.target.files[i].token` here and the
 * host returns the file's bytes as an ArrayBuffer.
 *
 * Returns `null` when the bytes are unavailable: an unknown/expired token, a file
 * over the host size ceiling, or a host that predates this capability. Always
 * handle `null` (e.g. surface an error and let the user retry) rather than
 * assuming bytes are present.
 */
export const readFrontComponentFile: ReadFrontComponentFileFunction = (
  token: string,
) => {
  const readFrontComponentFileFunction =
    frontComponentHostCommunicationApi.readFrontComponentFile;

  if (!isDefined(readFrontComponentFileFunction)) {
    return Promise.resolve(null);
  }

  return readFrontComponentFileFunction(token);
};
