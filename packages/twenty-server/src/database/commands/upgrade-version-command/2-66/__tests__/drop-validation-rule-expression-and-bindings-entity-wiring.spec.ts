import { DROP_VALIDATION_RULE_EXPRESSION_AND_BINDINGS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-66/drop-validation-rule-expression-and-bindings-upgrade-command-name.constant';
import { TWENTY_NEXT_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-next-versions.constant';
import { getWasRemovedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { ValidationRuleEntity } from 'src/engine/metadata-modules/validation-rule/entities/validation-rule.entity';

const nextVersions: readonly string[] = TWENTY_NEXT_VERSIONS;
const isDropCommandDormant = nextVersions.includes('2.66.0');

describe('validation rule expression and bindings removal wiring', () => {
  it.each(['expression', 'bindings'])(
    'marks %s as removed by the drop command once 2.66 is the current version',
    (propertyName) => {
      expect(
        getWasRemovedInUpgradePropertyMetadata(ValidationRuleEntity)[
          propertyName
        ]?.upgradeCommandName,
      ).toBe(
        isDropCommandDormant
          ? undefined
          : DROP_VALIDATION_RULE_EXPRESSION_AND_BINDINGS_UPGRADE_COMMAND_NAME,
      );
    },
  );
});
