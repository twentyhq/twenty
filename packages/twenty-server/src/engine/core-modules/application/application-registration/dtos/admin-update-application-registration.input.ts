import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UpdateApplicationRegistrationPayload } from 'src/engine/core-modules/application/application-registration/dtos/update-application-registration.input';

@InputType()
export class AdminUpdateApplicationRegistrationPayload extends UpdateApplicationRegistrationPayload {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isListed?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPreInstalled?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isVetted?: boolean;
}

@InputType()
export class AdminUpdateApplicationRegistrationInput {
  @IsNotEmpty()
  @Field()
  @IsUUID()
  id: string;

  @Type(() => AdminUpdateApplicationRegistrationPayload)
  @ValidateNested()
  @Field(() => AdminUpdateApplicationRegistrationPayload)
  update: AdminUpdateApplicationRegistrationPayload;
}
