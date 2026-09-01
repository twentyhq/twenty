import { type PathCommandMenuItemPayload } from '~/generated-metadata/graphql';

export const isPathCommandMenuItemPayload = (payload: {
  __typename?: string;
}): payload is PathCommandMenuItemPayload =>
  payload.__typename === 'PathCommandMenuItemPayload';
