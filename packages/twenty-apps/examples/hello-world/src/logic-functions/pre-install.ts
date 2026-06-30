import { definePreInstallLogicFunction } from 'twenty-sdk/define';
import { type InstallPayload } from 'twenty-sdk/logic-function';

const handler = async (payload: InstallPayload): Promise<void> => {
  console.log(
    'Pre install logic function executed successfully!',
    payload.previousVersion,
  );
};

export default definePreInstallLogicFunction({
  universalIdentifier: 'f8ad4b09-6a12-4b12-a52a-3472d3a78dc7',
  name: 'pre-install',
  description: 'Runs before installation to prepare the application.',
  timeoutSeconds: 300,
  handler,
});
