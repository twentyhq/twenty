import {
  type CommandMenuItemPayload,
  type PathCommandMenuItemPayload,
} from '~/generated-metadata/graphql';

export const isPathCommandMenuItemPayload = (
  payload: CommandMenuItemPayload,
): payload is PathCommandMenuItemPayload =>
  payload.__typename === 'PathCommandMenuItemPayload';
