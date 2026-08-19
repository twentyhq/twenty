import type { AxiosInstance } from "axios";
import { findSkills } from "src/logic-functions/requests/find-skills.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";

export const migrateSkills = async (targetWorkspace: AxiosInstance, sourceSkills: Awaited<ReturnType<typeof findSkills>>, targetSkills: Awaited<ReturnType<typeof findSkills>>) => {
  const existingTargetSkillIds = new Set(targetSkills.map((skill) => skill.id));

  let createdCount = 0;
  for (const skill of sourceSkills) {
    // Standard skills already exist in every workspace by construction (and the server
    // blocks non-standard-app callers from modifying them) - only custom ones need migrating.
    if (!skill.isCustom || existingTargetSkillIds.has(skill.id)) {
      continue;
    }
    await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createSkill', 'input', 'CreateSkillInput', {
      id: skill.id,
      name: skill.name,
      label: skill.label,
      icon: skill.icon,
      description: skill.description,
      content: skill.content,
    }));
    createdCount += 1;
  }

  logger.log(`Skills: created ${createdCount}`);
};