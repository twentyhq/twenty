import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

import { DISCORD_ADD_REACTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordAddReactionHandler } from 'src/logic-functions/handlers/discord-add-reaction-handler';
import { discordAddReactionInputSchema } from './schemas/discord-add-reaction-input.schema';

export default defineLogicFunction({
  universalIdentifier: DISCORD_ADD_REACTION_UNIVERSAL_IDENTIFIER,
  name: 'discord-add-reaction',
  description:
    'Add an emoji reaction to a Discord message (for example a checkmark ✅) so the channel can see status at a glance.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: discordAddReactionInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Add Discord Reaction',
    icon: 'IconBrandDiscord',
    inputSchema: jsonSchemaToInputSchema(discordAddReactionInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' },
          messageId: { type: 'string' },
          channelId: { type: 'string' },
        },
      },
    ],
  },
  handler: discordAddReactionHandler,
});
