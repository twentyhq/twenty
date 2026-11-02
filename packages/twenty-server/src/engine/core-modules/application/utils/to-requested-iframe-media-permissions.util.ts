import { msg } from '@lingui/core/macro';
import { isArray } from '@sniptt/guards';
import { MAX_ALLOWED_IFRAME_ORIGINS } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type IframeMediaPermission } from 'twenty-shared/types';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { toIframeMediaPermissions } from 'src/engine/core-modules/application/utils/to-iframe-media-permissions.util';

export const toRequestedIframeMediaPermissions = (
  permissions: unknown,
): IframeMediaPermission[] => {
  if (isArray(permissions) && permissions.length > MAX_ALLOWED_IFRAME_ORIGINS) {
    throw new ApplicationException(
      doNotTranslate('Too many requested iframe media origins'),
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`An application can request iframe media access for up to ${MAX_ALLOWED_IFRAME_ORIGINS} origins`,
      },
    );
  }

  return toIframeMediaPermissions(permissions);
};
