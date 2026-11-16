import { Field, InputType } from '@nestjs/graphql';
import { type AiChatAssistantProfile } from 'twenty-shared/ai';

@InputType()
export class AiChatAssistantProfileInput implements Partial<AiChatAssistantProfile> {
  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  avatarShape?: AiChatAssistantProfile['avatarShape'];

  @Field(() => String, { nullable: true })
  avatarColor?: AiChatAssistantProfile['avatarColor'];

  @Field(() => String, { nullable: true })
  avatarFace?: AiChatAssistantProfile['avatarFace'];

  @Field(() => Boolean, { nullable: true })
  isAvatarAnimated?: boolean;
}
