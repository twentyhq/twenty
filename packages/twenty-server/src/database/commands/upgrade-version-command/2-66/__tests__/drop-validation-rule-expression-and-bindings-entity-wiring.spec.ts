import { DROP_VALIDATION_RULE_EXPRESSION_AND_BINDINGS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-66/drop-validation-rule-expression-and-bindings-upgrade-command-name.constant';
import { getWasRemovedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { ValidationRuleEntity } from 'src/engine/metadata-modules/validation-rule/entities/validation-rule.entity';

describe('validation rule expression and bindings removal wiring', () => {
  it.each(['expression', 'bindings'])(
    'marks %s as removed by the drop command',
    (propertyName) => {
      expect(
        getWasRemovedInUpgradePropertyMetadata(ValidationRuleEntity)[
          propertyName
        ]?.upgradeCommandName,
      ).toBe(DROP_VALIDATION_RULE_EXPRESSION_AND_BINDINGS_UPGRADE_COMMAND_NAME);
    },
  );
});
