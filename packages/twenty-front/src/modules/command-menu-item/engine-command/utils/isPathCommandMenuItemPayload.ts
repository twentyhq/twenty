import { isNonEmptyString } from '@sniptt/guards';

import { type PathCommandMenuItemPayload } from '~/generated-metadata/graphql';

export const isPathCommandMenuItemPayload = (payload: {
  __typename?: string;
  path?: string | null;
}): payload is PathCommandMenuItemPayload => isNonEmptyString(payload.path);
