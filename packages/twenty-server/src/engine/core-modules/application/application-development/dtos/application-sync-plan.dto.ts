import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationSyncPlanAction')
export class ApplicationSyncPlanActionDTO {
  @Field(() => String)
  type: 'create' | 'update' | 'delete';

  @Field(() => String)
  metadataName: string;

  @Field(() => String, { nullable: true })
  universalIdentifier: string | null;

  @Field(() => String, { nullable: true })
  label: string | null;

  @Field(() => String)
  severity: 'safe' | 'breaking' | 'destructive';

  @Field(() => Int, { nullable: true })
  affectedRowCount: number | null;
}

@ObjectType('ApplicationSyncPlanSummary')
export class ApplicationSyncPlanSummaryDTO {
  @Field(() => Int)
  createCount: number;

  @Field(() => Int)
  updateCount: number;

  @Field(() => Int)
  deleteCount: number;

  @Field(() => Int)
  breakingCount: number;

  @Field(() => Int)
  destructiveCount: number;

  @Field(() => Int)
  totalAffectedRows: number;
}

@ObjectType('ApplicationSyncPlan')
export class ApplicationSyncPlanDTO {
  @Field(() => String)
  applicationUniversalIdentifier: string;

  @Field(() => String, { nullable: true })
  planId: string | null;

  @Field(() => String)
  planDigest: string;

  @Field(() => [ApplicationSyncPlanActionDTO])
  actions: ApplicationSyncPlanActionDTO[];

  @Field(() => ApplicationSyncPlanSummaryDTO)
  summary: ApplicationSyncPlanSummaryDTO;

  @Field(() => String, { nullable: true })
  currentVersion: string | null;

  @Field(() => String)
  proposedVersion: string;

  @Field(() => Boolean)
  isEmpty: boolean;

  @Field(() => Boolean)
  hasDestructiveActions: boolean;
}
