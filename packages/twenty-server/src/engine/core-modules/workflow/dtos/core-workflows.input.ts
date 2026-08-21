import { ArgsType, Field, Int, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum CoreWorkflowOrderByField {
  NAME = 'name',
  UPDATED_AT = 'updatedAt',
}

export enum CoreWorkflowOrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(CoreWorkflowOrderByField, {
  name: 'CoreWorkflowOrderByField',
});

registerEnumType(CoreWorkflowOrderByDirection, {
  name: 'CoreWorkflowOrderByDirection',
});

@ArgsType()
export class CoreWorkflowsArgs {
  @Field(() => Int, { nullable: true, defaultValue: 60 })
  @IsInt()
  @Min(1)
  @Max(200)
  first: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  after?: string;

  @Field(() => CoreWorkflowOrderByField, {
    nullable: true,
    defaultValue: CoreWorkflowOrderByField.UPDATED_AT,
  })
  @IsEnum(CoreWorkflowOrderByField)
  orderBy: CoreWorkflowOrderByField;

  @Field(() => CoreWorkflowOrderByDirection, {
    nullable: true,
    defaultValue: CoreWorkflowOrderByDirection.DESC,
  })
  @IsEnum(CoreWorkflowOrderByDirection)
  orderByDirection: CoreWorkflowOrderByDirection;
}
