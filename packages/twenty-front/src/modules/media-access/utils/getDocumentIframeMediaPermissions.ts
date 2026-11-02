import { isArray, isBoolean, isObject, isString } from '@sniptt/guards';
import { IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID } from 'twenty-shared/constants';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { logError } from '~/utils/logError';

const isIframeMediaPermission = (
  value: unknown,
): value is IframeMediaPermission =>
  isObject(value) &&
  'origin' in value &&
  isString(value.origin) &&
  'microphone' in value &&
  isBoolean(value.microphone) &&
  'camera' in value &&
  isBoolean(value.camera);

export const getDocumentIframeMediaPermissions = ():
  | IframeMediaPermission[]
  | undefined => {
  const element = document.getElementById(
    IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID,
  );

  if (!isDefined(element)) {
    return undefined;
  }

  try {
    const permissions: unknown = JSON.parse(element.textContent ?? 'null');

    return isArray(permissions)
      ? permissions.filter(isIframeMediaPermission)
      : [];
  } catch (error) {
    logError(error);

    return [];
  }
};
