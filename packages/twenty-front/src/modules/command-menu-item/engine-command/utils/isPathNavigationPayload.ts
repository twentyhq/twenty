import {
  type NavigationPayload,
  type PathNavigationPayload,
} from '~/generated-metadata/graphql';

export const isPathNavigationPayload = (
  payload: NavigationPayload,
): payload is PathNavigationPayload =>
  'path' in payload && typeof payload.path === 'string';
