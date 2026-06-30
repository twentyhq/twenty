import { Field, ObjectType } from '@nestjs/graphql';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsBoolean, IsString } from 'class-validator';
import { IDField } from '@ptc-org/nestjs-query-graphql';

@ObjectType()
export class ApplicationRegistrationVariableDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  key: string;

  @IsString()
  @Field(() => String, { nullable: true })
  value?: string | null;

  @IsString()
  @Field()
  description: string;

  @IsBoolean()
  @Field()
  isSecret: boolean;

  @IsBoolean()
  @Field()
  isRequired: boolean;

  @IsBoolean()
  @Field()
  isFilled: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
