import { Field, ObjectType } from '@nestjs/graphql';
import { type AiChatAssistantProfile } from 'twenty-shared/ai';

@ObjectType('AiChatAssistantProfile')
export class AiChatAssistantProfileDTO implements AiChatAssistantProfile {
  @Field(() => String)
  displayName: string;

  @Field(() => String)
  avatarShape: AiChatAssistantProfile['avatarShape'];

  @Field(() => String)
  avatarColor: AiChatAssistantProfile['avatarColor'];

  @Field(() => String)
  avatarFace: AiChatAssistantProfile['avatarFace'];

  @Field(() => Boolean)
  isAvatarAnimated: boolean;
}
