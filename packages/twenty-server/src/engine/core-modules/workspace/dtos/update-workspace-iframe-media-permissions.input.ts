import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { type IframeMediaPermission } from 'twenty-shared/types';

@InputType()
export class UpdateWorkspaceIframeMediaPermissionsInput implements IframeMediaPermission {
  @Field()
  @IsString()
  origin: string;

  @Field()
  @IsBoolean()
  microphone: boolean;

  @Field()
  @IsBoolean()
  camera: boolean;
}
