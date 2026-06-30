import { definePreInstallLogicFunction } from 'twenty-sdk/define';

const handler = async (params: any) => {
  console.log(
    `Pre-install logic function executed successfully with params`,
    params,
  );
  return {};
};

export default definePreInstallLogicFunction({
  universalIdentifier: 'bf27f558-4ec6-481f-b76e-1dbcd05aef1f',
  name: 'pre-install',
  description: 'Runs before migrations to set up the application.',
  timeoutSeconds: 10,
  handler,
});
