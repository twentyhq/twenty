import { IsEnum } from 'class-validator';

export class AgentResponseFormatText {
  @IsEnum(['text'])
  type: 'text';
}
