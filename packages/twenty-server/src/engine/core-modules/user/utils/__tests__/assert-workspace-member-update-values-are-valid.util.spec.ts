import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { assertWorkspaceMemberUpdateValuesAreValid } from 'src/engine/core-modules/user/utils/assert-workspace-member-update-values-are-valid.util';

describe('assertWorkspaceMemberUpdateValuesAreValid', () => {
  it.each(['Smaller', 'Default', 'Large', 'Larger'] as const)(
    'should accept uiScale %s',
    (uiScale) => {
      expect(() =>
        assertWorkspaceMemberUpdateValuesAreValid({ update: { uiScale } }),
      ).not.toThrow();
    },
  );

  it('should ignore updates that do not touch a value-checked field', () => {
    expect(() =>
      assertWorkspaceMemberUpdateValuesAreValid({
        update: { timeZone: 'Europe/Paris' },
      }),
    ).not.toThrow();
  });

  it.each(['smaller', 'XL', '', 'constructor', 1.25, null, ['Large']])(
    'should reject uiScale %p',
    (uiScale) => {
      expect(() =>
        assertWorkspaceMemberUpdateValuesAreValid({ update: { uiScale } }),
      ).toThrow(UserInputError);
    },
  );
});
