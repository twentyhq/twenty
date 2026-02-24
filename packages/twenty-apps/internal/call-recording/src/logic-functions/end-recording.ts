import { defineLogicFunction } from 'twenty-sdk';

const handler = async (): Promise<void> => {
  // TODO: implement end recording logic
};

export default defineLogicFunction({
  universalIdentifier: '471353f6-5933-417b-8062-9ad0fc44cd7f',
  name: 'end-recording',
  description: 'Endpoint to end a call recording',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/end-recording',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
