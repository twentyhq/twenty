import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import {
  LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG,
  LAMBDA_SDK_CLIENT_CHECKSUM_TAG,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';

// Executors also add SDK and bundle checksums to the 50-tag budget.
const MAX_CONFIGURED_LAMBDA_RESOURCE_TAGS = 48;
const TAG_CHARACTERS = /^[\p{L}\p{Z}\p{N}_.:/=+\-@]*$/u;

export const isLambdaResourceTags = (
  value: unknown,
): value is Record<string, string> => {
  if (!isPlainObject(value)) {
    return false;
  }

  const entries = Object.entries(value);

  if (entries.length > MAX_CONFIGURED_LAMBDA_RESOURCE_TAGS) {
    return false;
  }

  return entries.every(
    ([key, tagValue]) =>
      key.length > 0 &&
      Array.from(key).length <= 128 &&
      !key.toLowerCase().startsWith('aws:') &&
      key !== LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG &&
      key !== LAMBDA_SDK_CLIENT_CHECKSUM_TAG &&
      TAG_CHARACTERS.test(key) &&
      isString(tagValue) &&
      Array.from(tagValue).length <= 256 &&
      TAG_CHARACTERS.test(tagValue),
  );
};
