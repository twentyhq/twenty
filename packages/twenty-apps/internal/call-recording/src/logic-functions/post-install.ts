import { defineLogicFunction } from 'twenty-sdk';

export const POST_INSTALL_UNIVERSAL_IDENTIFIER = '3f4dc653-1a98-4698-9484-82d8bfc12de0';

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
