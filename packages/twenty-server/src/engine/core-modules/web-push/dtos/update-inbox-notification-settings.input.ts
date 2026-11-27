import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsIn } from 'class-validator';
import {
  AGENT_CHAT_INBOX_NOTIFICATION_LEVEL,
  type AgentChatInboxNotificationLevel,
} from 'twenty-shared/ai';

@InputType()
export class UpdateInboxNotificationSettingsInput {
  @Field(() => String)
  @IsIn(Object.values(AGENT_CHAT_INBOX_NOTIFICATION_LEVEL))
  inboxNotificationLevel: AgentChatInboxNotificationLevel;

  @Field(() => Boolean)
  @IsBoolean()
  isInboxNotificationPreviewEnabled: boolean;
}
