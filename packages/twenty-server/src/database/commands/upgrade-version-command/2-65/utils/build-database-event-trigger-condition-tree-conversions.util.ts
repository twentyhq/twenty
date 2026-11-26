import { isNonEmptyString } from '@sniptt/guards';
import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { renameLegacyExpressionToCurrentFieldNames } from 'src/database/commands/upgrade-version-command/2-65/utils/rename-legacy-expression-to-current-field-names.util';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { compileValidationRuleTree } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-tree.util';
import { buildDatabaseEventTriggerConditionFields } from 'src/engine/workspace-event-emitter/utils/build-database-event-trigger-condition-fields.util';

type LegacyDatabaseEventTriggerSettings = DatabaseEventTriggerSettings & {
  conditionBindings?: Record<string, string>;
};

type ConditionMaps = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

// Undefined when there is nothing to convert, or the condition does not compile and keeps its text
const convertSettings = ({
  settings,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: ConditionMaps & {
  settings: LegacyDatabaseEventTriggerSettings;
}): DatabaseEventTriggerSettings | undefined => {
  const {
    condition,
    conditionBindings,
    conditionTree,
    ...settingsWithoutCondition
  } = settings;

  if (!isNonEmptyString(condition) || isDefined(conditionTree)) {
    return undefined;
  }

  const fields = buildDatabaseEventTriggerConditionFields({
    eventName: settings.eventName,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  if (!isDefined(fields)) {
    return undefined;
  }

  const compilation = compileValidationRuleTree({
    expression: renameLegacyExpressionToCurrentFieldNames({
      expression: condition,
      bindings: conditionBindings ?? {},
      fields,
    }),
    fields,
  });

  return compilation.isValid
    ? { ...settingsWithoutCondition, conditionTree: compilation.tree }
    : undefined;
};

const hasTextCondition = (settings: DatabaseEventTriggerSettings) =>
  isNonEmptyString(settings.condition) && !isDefined(settings.conditionTree);

export const buildDatabaseEventTriggerConditionTreeConversions = ({
  flatAgents,
  flatLogicFunctions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: ConditionMaps & {
  flatAgents: FlatAgent[];
  flatLogicFunctions: FlatLogicFunction[];
}): {
  flatAgentsToUpdate: FlatAgent[];
  flatLogicFunctionsToUpdate: FlatLogicFunction[];
  textConditionOwnerIds: string[];
} => {
  const maps = { flatObjectMetadataMaps, flatFieldMetadataMaps };
  const flatAgentsToUpdate: FlatAgent[] = [];
  const flatLogicFunctionsToUpdate: FlatLogicFunction[] = [];
  const textConditionOwnerIds: string[] = [];

  for (const flatAgent of flatAgents) {
    const triggers = flatAgent.triggers.map((trigger) => {
      if (trigger.type !== 'DATABASE_EVENT') {
        return trigger;
      }

      const settings = convertSettings({ settings: trigger.settings, ...maps });

      return isDefined(settings) ? { ...trigger, settings } : trigger;
    });
    const hasConvertedTrigger = triggers.some(
      (trigger, index) => trigger !== flatAgent.triggers[index],
    );

    if (
      triggers.some(
        (trigger) =>
          trigger.type === 'DATABASE_EVENT' && hasTextCondition(trigger.settings),
      )
    ) {
      textConditionOwnerIds.push(flatAgent.id);
    }

    if (hasConvertedTrigger) {
      flatAgentsToUpdate.push({ ...flatAgent, triggers });
    }
  }

  for (const flatLogicFunction of flatLogicFunctions) {
    const { databaseEventTriggerSettings } = flatLogicFunction;

    if (!isDefined(databaseEventTriggerSettings)) {
      continue;
    }

    const settings = convertSettings({
      settings: databaseEventTriggerSettings,
      ...maps,
    });

    if (isDefined(settings)) {
      flatLogicFunctionsToUpdate.push({
        ...flatLogicFunction,
        databaseEventTriggerSettings: settings,
      });
    } else if (hasTextCondition(databaseEventTriggerSettings)) {
      textConditionOwnerIds.push(flatLogicFunction.id);
    }
  }

  return {
    flatAgentsToUpdate,
    flatLogicFunctionsToUpdate,
    textConditionOwnerIds,
  };
};
