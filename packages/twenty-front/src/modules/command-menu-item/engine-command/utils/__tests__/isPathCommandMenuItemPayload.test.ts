import { isPathCommandMenuItemPayload } from '@/command-menu-item/engine-command/utils/isPathCommandMenuItemPayload';
import { type CommandMenuItemPayload } from '~/generated-metadata/graphql';

describe('isPathCommandMenuItemPayload', () => {
  it('should return true for a PathCommandMenuItemPayload', () => {
    const payload: CommandMenuItemPayload = {
      __typename: 'PathCommandMenuItemPayload',
      path: '/settings',
    };

    expect(isPathCommandMenuItemPayload(payload)).toBe(true);
  });
});
