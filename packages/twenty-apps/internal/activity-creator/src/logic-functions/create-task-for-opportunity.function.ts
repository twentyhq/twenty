import { defineLogicFunction } from 'twenty-sdk/define';

import { TARGET_OBJECTS } from 'src/constants/target-objects';
import { CREATE_TASK_FOR_OPPORTUNITY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildCreateTaskConfig } from 'src/logic-functions/utils/build-create-task-config';

export default defineLogicFunction(
  buildCreateTaskConfig({
    universalIdentifier:
      CREATE_TASK_FOR_OPPORTUNITY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    target: TARGET_OBJECTS.opportunity,
  }),
);
