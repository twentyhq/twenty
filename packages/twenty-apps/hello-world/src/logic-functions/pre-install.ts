import { definePreInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Pre install logic function executed successfully!', payload.previousVersion);
};

export default definePreInstallLogicFunction({
  universalIdentifier: '68d005d4-1110-4fa0-8227-71e06d6b9f30',
  name: 'pre-install',
  description: 'Runs before installation to prepare the application.',
  timeoutSeconds: 300,
  handler,
});
