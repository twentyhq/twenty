import { Field, registerEnumType } from '@nestjs/graphql';

export enum AdminPanelIndicatorHealthStatusInputEnum {
  DATABASE = 'database',
  REDIS = 'redis',
  WORKER = 'worker',
  MESSAGE_SYNC = 'messageSync',
}

registerEnumType(AdminPanelIndicatorHealthStatusInputEnum, {
  name: 'AdminPanelIndicatorHealthStatusInputEnum',
});

export class AdminPanelIndicatorHealthStatusInput {
  @Field(() => AdminPanelIndicatorHealthStatusInputEnum)
  indicatorName: AdminPanelIndicatorHealthStatusInputEnum;
}
