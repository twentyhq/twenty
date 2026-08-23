import type { AxiosInstance } from "axios";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { Skill } from "src/logic-functions/types/skill.type";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { setStateRef } from "src/logic-functions/utils/migration-state.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { decrementEstimate } from "src/logic-functions/utils/estimate-migration-duration.util";

export const migrateSkills = async (targetWorkspace: AxiosInstance, sourceSkills: Skill[], targetSkills: Skill[]) => {
  const targetSkillIds = new Set(targetSkills.map((skill) => skill.id));
  // Standard skills are provisioned server-side in every workspace, so recreating them would
  // duplicate them wherever the two workspaces don't happen to agree on their ids.
  const skillsToMigrate = sourceSkills.filter((skill) => skill.isCustom && targetSkillIds.has(skill.id) === false);
  let createdCount = 0;

  for (const skill of skillsToMigrate) {
    await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createSkill', 'input', 'CreateSkillInput', {
      id: skill.id,
      name: skill.name,
      label: skill.label,
      icon: skill.icon,
      description: skill.description,
      content: skill.content,
    }));
    createdCount += 1;
    decrementEstimate({ otherRecordCount: 1 });
    if (await stopIfTimeBudgetExceeded()) {
      return false;
    }
  }

  setStateRef('migratedSkills', true);
  logger.log(`Skills: created ${createdCount}`);
  return true;
};