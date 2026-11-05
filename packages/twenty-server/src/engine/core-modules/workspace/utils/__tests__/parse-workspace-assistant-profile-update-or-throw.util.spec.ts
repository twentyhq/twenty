import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { parseWorkspaceAssistantProfileUpdateOrThrow } from 'src/engine/core-modules/workspace/utils/parse-workspace-assistant-profile-update-or-throw.util';

describe('parseWorkspaceAssistantProfileUpdateOrThrow', () => {
  it('returns the parsed partial profile without adding omitted fields', () => {
    expect(
      parseWorkspaceAssistantProfileUpdateOrThrow({
        profile: { displayName: '  Scout  ' },
        reset: undefined,
      }),
    ).toEqual({
      profile: { displayName: 'Scout' },
      shouldReplaceProfile: false,
    });
  });

  it('rejects unsupported profile fields', () => {
    expect(() =>
      parseWorkspaceAssistantProfileUpdateOrThrow({
        profile: { displayName: 'Scout', unsupported: true },
        reset: undefined,
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
