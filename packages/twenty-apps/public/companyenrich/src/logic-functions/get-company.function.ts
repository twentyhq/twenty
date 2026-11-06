import { defineLogicFunction } from 'twenty-sdk/define';

import { createResearchFunction } from 'src/logic-functions/utils/create-research-function';

export default defineLogicFunction(createResearchFunction('get-company'));
