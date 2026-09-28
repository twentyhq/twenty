import { defineWorkflow } from 'twenty-sdk/define';
import { GREET_UNIVERSAL_IDENTIFIER } from '../logic-functions/greet.function';

const GREET_STEP_ID = 'a90528b8-5a87-4cd8-8dc5-b93f7e864c15';

export default defineWorkflow({
  universalIdentifier: '96cfb613-dc0f-47c4-9410-8971ebc3c263',
  name: 'Application greeting',
  version: {
    universalIdentifier: '0f1d0260-e781-4501-9d26-1e7f73585331',
    trigger: {
      universalIdentifier: '02720fe3-1977-4306-a9c3-66f7c99e3199',
      type: 'MANUAL',
      nextStepIds: [GREET_STEP_ID],
    },
    steps: [
      {
        universalIdentifier: GREET_STEP_ID,
        name: 'Greet',
        type: 'LOGIC_FUNCTION',
        logicFunctionUniversalIdentifier: GREET_UNIVERSAL_IDENTIFIER,
        input: { greeting: 'Before upgrade' },
        nextStepIds: [],
      },
    ],
  },
});
