import { defineAgent } from 'twenty-sdk/define';

export default defineAgent({
  universalIdentifier: 'b8d4f2a3-9c5e-4f7b-a012-3e4d5c6b7a8f',
  name: 'postcard-drafter',
  label: 'Postcard Drafter',
  icon: 'IconRobot',
  description: 'Helps draft postcard messages',
  prompt:
    'You are a postcard writing assistant. Help users draft concise, warm ' +
    'postcard messages. Follow the postcard writing guidelines. Ask for the ' +
    'recipient name and the occasion if not provided.',
});
