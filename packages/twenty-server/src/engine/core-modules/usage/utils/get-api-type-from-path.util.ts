/* @license Enterprise */

import { API_TYPE_BY_PATH_PREFIX } from 'src/engine/core-modules/usage/constants/api-types.constant';
import { type ApiType } from 'src/engine/core-modules/usage/types/api-type.type';

export const getApiTypeFromPath = (path: string): ApiType | undefined => {
  const [pathPrefix] = path.replace(/^\//, '').split('/');

  return API_TYPE_BY_PATH_PREFIX[pathPrefix];
};
