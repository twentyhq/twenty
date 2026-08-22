import type { AxiosInstance } from "axios";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { Skill } from "src/logic-functions/types/skill.type";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { migrationState, setStateRef } from "src/logic-functions/utils/migration-state.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";

export const migrateSkills = async (targetWorkspace: AxiosInstance, sourceSkills: Skill[], targetSkills: Skill[]) => {
  const targetSkillsIds = new Set(targetSkills.map(webhook => webhook.id));
  const skillsToMigrate: Skill[] = targetSkillsIds.size === 0 ? sourceSkills : sourceSkills.filter(webhook => targetSkillsIds.has(webhook.id) === false);
  let recordsMigrated = 2;
  for (const skill of skillsToMigrate) {
    await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createSkill', 'input', 'CreateSkillInput', {
      id: skill.id,
      name: skill.name,
      label: skill.label,
      icon: skill.icon,
      description: skill.description,
      content: skill.content,
    }));
    recordsMigrated++;
    if (recordsMigrated % migrationState.maxRequests === 0) {
      recordsMigrated = 0;
      if (await stopIfTimeBudgetExceeded()) {
        return false;
      }
    }
  }
  setStateRef('migratedSkills', true);
  logger.log(`Skills migrated`);
  return true;
};