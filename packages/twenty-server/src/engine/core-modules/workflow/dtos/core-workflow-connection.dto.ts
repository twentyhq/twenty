import { Field, Int, ObjectType } from '@nestjs/graphql';

import { CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';

@ObjectType('CoreWorkflowEdge')
export class CoreWorkflowEdgeDTO {
  @Field(() => CoreWorkflowDTO)
  node: CoreWorkflowDTO;

  @Field(() => String)
  cursor: string;
}

@ObjectType('CoreWorkflowPageInfo')
export class CoreWorkflowPageInfoDTO {
  @Field(() => String, { nullable: true })
  endCursor: string | null;

  @Field(() => Boolean)
  hasNextPage: boolean;
}

@ObjectType('CoreWorkflowConnection')
export class CoreWorkflowConnectionDTO {
  @Field(() => [CoreWorkflowEdgeDTO])
  edges: CoreWorkflowEdgeDTO[];

  @Field(() => CoreWorkflowPageInfoDTO)
  pageInfo: CoreWorkflowPageInfoDTO;

  @Field(() => Int)
  totalCount: number;
}
