import {
  type CommandMenuItemPayload,
  type ObjectMetadataCommandMenuItemPayload,
} from '~/generated-metadata/graphql';

export const isObjectMetadataCommandMenuItemPayload = (
  payload: CommandMenuItemPayload,
): payload is ObjectMetadataCommandMenuItemPayload =>
  payload.__typename === 'ObjectMetadataCommandMenuItemPayload';
