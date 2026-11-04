import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/application-monitoring.dto';

@ObjectType('ApplicationMonitoringWorkspace')
export class ApplicationMonitoringWorkspaceDTO {
  @Field(() => String)
  workspaceId: string;

  @Field(() => String, { nullable: true })
  workspaceName: string | null;

  @Field(() => String, { nullable: true })
  workspaceLogoUrl: string | null;

  @Field(() => String)
  applicationVersion: string;

  @Field(() => Int)
  runCount: number;

  @Field(() => Int)
  failedRunCount: number;

  @Field(() => Int)
  rateLimitEventCount: number;

  @Field(() => Date)
  lastEventAt: Date;
}

@ObjectType('AdminApplicationMonitoring')
export class AdminApplicationMonitoringDTO extends ApplicationMonitoringDTO {
  @Field(() => Int)
  activeWorkspaceCount: number;

  @Field(() => [ApplicationMonitoringWorkspaceDTO])
  workspaces: ApplicationMonitoringWorkspaceDTO[];
}
