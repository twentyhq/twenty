import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { WORKSPACE_DISPLAY_NAME_MAX_LENGTH } from 'twenty-shared/constants';

import { SignUpInNewWorkspaceInput } from 'src/engine/core-modules/auth/dto/sign-up-in-new-workspace.input';

describe('SignUpInNewWorkspaceInput display name', () => {
  const validateDisplayName = (displayName: string) =>
    validate(plainToInstance(SignUpInNewWorkspaceInput, { displayName }));

  it('accepts a name at the limit with surrounding whitespace', async () => {
    expect(
      await validateDisplayName(
        ` ${'a'.repeat(WORKSPACE_DISPLAY_NAME_MAX_LENGTH)} `,
      ),
    ).toEqual([]);
  });

  it('rejects a name over the limit', async () => {
    expect(
      await validateDisplayName(
        'a'.repeat(WORKSPACE_DISPLAY_NAME_MAX_LENGTH + 1),
      ),
    ).toEqual([expect.objectContaining({ property: 'displayName' })]);
  });
});
