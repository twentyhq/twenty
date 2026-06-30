import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly } from 'src/engine/core-modules/user/utils/assert-workspace-member-update-non-custom-fields.util';

describe('assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly', () => {
  it('should throw when the update payload is empty', () => {
    expect(() =>
      assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly({ update: {} }),
    ).toThrow(UserInputError);

    expect(() =>
      assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly({ update: {} }),
    ).toThrow('Update payload cannot be empty');
  });

  it('should not throw when all top-level keys are standard workspaceMember fields', () => {
    expect(() =>
      assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly({
        update: {
          timeZone: 'Europe/Paris',
          locale: 'en',
        },
      }),
    ).not.toThrow();
  });

  it.each(['userId', 'id'] as const)(
    'should throw when the update includes %s',
    (fieldName) => {
      expect(() =>
        assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly({
          update: {
            [fieldName]: 'value',
          },
        }),
      ).toThrow(UserInputError);

      expect(() =>
        assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly({
          update: {
            [fieldName]: 'value',
          },
        }),
      ).toThrow(
        `Cannot update custom workspaceMember field via this endpoint: ${fieldName}`,
      );
    },
  );

  it('should throw when a top-level key is not in the standard field allowlist', () => {
    const unknownKey = 'notAWorkspaceMemberField';

    expect(() =>
      assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly({
        update: {
          [unknownKey]: 'value',
        },
      }),
    ).toThrow(UserInputError);

    expect(() =>
      assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly({
        update: {
          [unknownKey]: 'value',
        },
      }),
    ).toThrow(
      `Cannot update custom workspaceMember field via this endpoint: ${unknownKey}`,
    );
  });

  it('should reject the payload when a disallowed key is mixed with allowed keys', () => {
    const unknownKey = 'typoTimeZone';

    expect(() =>
      assertWorkspaceMemberUpdateUsesNonCustomFieldsOnly({
        update: {
          timeZone: 'Europe/Paris',
          [unknownKey]: 'x',
        },
      }),
    ).toThrow(
      `Cannot update custom workspaceMember field via this endpoint: ${unknownKey}`,
    );
  });
});
