import { isObjectMetadataCommandMenuItemPayload } from '@/command-menu-item/engine-command/utils/isObjectMetadataCommandMenuItemPayload';
import { type CommandMenuItemPayload } from '~/generated-metadata/graphql';

describe('isObjectMetadataCommandMenuItemPayload', () => {
  it('should return true for an ObjectMetadataCommandMenuItemPayload', () => {
    const payload: CommandMenuItemPayload = {
      __typename: 'ObjectMetadataCommandMenuItemPayload',
      objectMetadataItemId: 'some-uuid',
    };

    expect(isObjectMetadataCommandMenuItemPayload(payload)).toBe(true);
  });

  it('should return false for a PathCommandMenuItemPayload', () => {
    const payload: CommandMenuItemPayload = {
      __typename: 'PathCommandMenuItemPayload',
      path: '/settings',
    };

    expect(isObjectMetadataCommandMenuItemPayload(payload)).toBe(false);
  });
});
