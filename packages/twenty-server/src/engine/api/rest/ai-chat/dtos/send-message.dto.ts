import {
  IsString,
  IsOptional,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LinkedEntityDto {
  @IsString()
  @IsIn(['company', 'contact', 'document'])
  type: 'company' | 'contact' | 'document';

  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LinkedEntityDto)
  linkedEntity?: LinkedEntityDto;
}
