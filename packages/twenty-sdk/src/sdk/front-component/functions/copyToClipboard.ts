import { isDefined } from 'twenty-shared/utils';

import {
  type CopyToClipboardFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

export const copyToClipboard: CopyToClipboardFunction = (text: string) => {
  const copyToClipboardFunction =
    frontComponentHostCommunicationApi.copyToClipboard;

  if (!isDefined(copyToClipboardFunction)) {
    throw new Error('copyToClipboardFunction is not set');
  }

  return copyToClipboardFunction(text);
};
