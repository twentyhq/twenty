import { DEFAULT_AI_CHAT_ASSISTANT_PROFILE } from 'twenty-shared/ai';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { parseWorkspaceAssistantProfileUpdateOrThrow } from 'src/engine/core-modules/workspace/utils/parse-workspace-assistant-profile-update-or-throw.util';

describe('parseWorkspaceAssistantProfileUpdateOrThrow', () => {
  it.each([undefined, false])(
    'leaves an omitted profile unchanged with reset %s',
    (reset) => {
      expect(
        parseWorkspaceAssistantProfileUpdateOrThrow({
          profile: undefined,
          reset,
        }),
      ).toBeUndefined();
    },
  );

  it('normalizes only supplied profile keys and preserves false', () => {
    expect(
      parseWorkspaceAssistantProfileUpdateOrThrow({
        profile: { displayName: '  Scout  ', isAvatarAnimated: false },
        reset: undefined,
      }),
    ).toEqual({
      profile: { displayName: 'Scout', isAvatarAnimated: false },
      shouldReplaceProfile: false,
    });
  });

  it('replaces the complete profile with the shared defaults on reset', () => {
    expect(
      parseWorkspaceAssistantProfileUpdateOrThrow({
        profile: undefined,
        reset: true,
      }),
    ).toEqual({
      profile: DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
      shouldReplaceProfile: true,
    });
  });

  it.each([null, { displayName: null }, { unsupported: true }])(
    'rejects invalid profile patches %j',
    (profile) => {
      expect(() =>
        parseWorkspaceAssistantProfileUpdateOrThrow({
          profile,
          reset: undefined,
        }),
      ).toThrow(UserInputError);
    },
  );

  it.each([null, 'true'])('rejects invalid reset values %j', (reset) => {
    expect(() =>
      parseWorkspaceAssistantProfileUpdateOrThrow({
        profile: undefined,
        reset,
      }),
    ).toThrow(UserInputError);
  });

  it('rejects combining reset and profile edits', () => {
    expect(() =>
      parseWorkspaceAssistantProfileUpdateOrThrow({
        profile: { displayName: 'Scout' },
        reset: true,
      }),
    ).toThrow(UserInputError);
  });
});
