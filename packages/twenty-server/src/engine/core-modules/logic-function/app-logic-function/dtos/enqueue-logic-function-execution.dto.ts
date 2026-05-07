import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class EnqueueLogicFunctionExecutionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  universalIdentifier?: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
