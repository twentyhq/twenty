import { defineIndex } from 'twenty-sdk/define';

import {
  SESSION_OPERATION_KEY_IDENTIFIER,
  SESSION_OPERATION_OBJECT_IDENTIFIER,
} from 'src/objects/session-operation.object';

export default defineIndex({
  universalIdentifier: 'd6aeb18b-d0d7-407b-b645-197ecb010b01',
  objectUniversalIdentifier: SESSION_OPERATION_OBJECT_IDENTIFIER,
  isUnique: true,
  fields: [
    {
      universalIdentifier: '578f4556-bd72-4862-8858-7420473d75a8',
      fieldUniversalIdentifier: SESSION_OPERATION_KEY_IDENTIFIER,
    },
  ],
});
