import { Field, ObjectType } from '@nestjs/graphql';

import { ApplicationHealthStatus } from 'src/engine/core-modules/application/enums/application-health-status.enum';
import { ApplicationSettingsTab } from 'src/engine/core-modules/application/enums/application-settings-tab.enum';

@ObjectType('ApplicationHealthCheckAction')
export class ApplicationHealthCheckActionDTO {
  @Field(() => String)
  label: string;

  @Field(() => ApplicationSettingsTab)
  settingsTab: ApplicationSettingsTab;
}

@ObjectType('ApplicationHealthCheckResult')
export class ApplicationHealthCheckResultDTO {
  @Field(() => ApplicationHealthStatus)
  status: ApplicationHealthStatus;

  @Field(() => String, { nullable: true })
  message: string | null;

  @Field(() => ApplicationHealthCheckActionDTO, { nullable: true })
  action: ApplicationHealthCheckActionDTO | null;
}
