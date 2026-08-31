import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export const MAX_CORE_WORKFLOW_FILTER_RULES = 50;

export enum CoreWorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

export enum CoreWorkflowFilterFieldKey {
  NAME = 'NAME',
  STATUSES = 'STATUSES',
  UPDATED_AT = 'UPDATED_AT',
}

export enum CoreWorkflowFilterOperand {
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  IS = 'IS',
  IS_NOT = 'IS_NOT',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
  IS_BEFORE = 'IS_BEFORE',
  IS_AFTER = 'IS_AFTER',
  IS_IN_PAST = 'IS_IN_PAST',
  IS_IN_FUTURE = 'IS_IN_FUTURE',
  IS_TODAY = 'IS_TODAY',
  IS_RELATIVE = 'IS_RELATIVE',
}

export enum CoreWorkflowFilterLogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

registerEnumType(CoreWorkflowFilterFieldKey, {
  name: 'CoreWorkflowFilterFieldKey',
});

registerEnumType(CoreWorkflowFilterOperand, {
  name: 'CoreWorkflowFilterOperand',
});

registerEnumType(CoreWorkflowFilterLogicalOperator, {
  name: 'CoreWorkflowFilterLogicalOperator',
});

@InputType()
export class CoreWorkflowFilterRuleInput {
  @Field(() => CoreWorkflowFilterFieldKey)
  @IsEnum(CoreWorkflowFilterFieldKey)
  fieldKey: CoreWorkflowFilterFieldKey;

  @Field(() => CoreWorkflowFilterOperand)
  @IsEnum(CoreWorkflowFilterOperand)
  operand: CoreWorkflowFilterOperand;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  value?: string | null;
}

@InputType()
export class CoreWorkflowFilterInput {
  @Field(() => CoreWorkflowFilterLogicalOperator)
  @IsEnum(CoreWorkflowFilterLogicalOperator)
  logicalOperator: CoreWorkflowFilterLogicalOperator;

  @Field(() => [CoreWorkflowFilterRuleInput])
  @ArrayMaxSize(MAX_CORE_WORKFLOW_FILTER_RULES)
  @ValidateNested({ each: true })
  @Type(() => CoreWorkflowFilterRuleInput)
  rules: CoreWorkflowFilterRuleInput[];
}
