import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { parseWorkspaceAssistantProfilePatchOrThrow } from 'src/engine/core-modules/workspace/utils/parse-workspace-assistant-profile-patch-or-throw.util';

describe('parseWorkspaceAssistantProfilePatchOrThrow', () => {
  it('returns the parsed partial profile without adding omitted fields', () => {
    expect(
      parseWorkspaceAssistantProfilePatchOrThrow({ displayName: '  Scout  ' }),
    ).toEqual({ displayName: 'Scout' });
  });

  it('rejects unsupported profile fields', () => {
    expect(() =>
      parseWorkspaceAssistantProfilePatchOrThrow({
        displayName: 'Scout',
        unsupported: true,
      }),
    ).toThrow(UserInputError);
  });
});
