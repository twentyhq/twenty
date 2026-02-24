import { defineLogicFunction } from 'twenty-sdk';

export const POST_INSTALL_UNIVERSAL_IDENTIFIER = '6636b482-e068-4c87-a507-e0af4090eb5f';

const handler = async (): Promise<void> => {
  console.log('Post install logic function executed successfully!');
};

export default defineLogicFunction({
  universalIdentifier: POST_INSTALL_UNIVERSAL_IDENTIFIER,
  name: 'post-install',
  description: 'Runs after installation to set up the application.',
  timeoutSeconds: 300,
  handler,
});
