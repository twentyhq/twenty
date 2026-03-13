import { definePreInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Pre install logic function executed successfully!', payload.previousVersion);
};

export default definePreInstallLogicFunction({
  universalIdentifier: '1272ffdb-8e2f-492c-ab37-66c2b97e9c23',
  name: 'pre-install',
  description: 'Runs before installation to prepare the application.',
  timeoutSeconds: 300,
  handler,
});
