import { Field, registerEnumType } from '@nestjs/graphql';

export enum AdminPanelIndicatorHealthStatusInputEnum {
  DATABASE = 'database',
  REDIS = 'redis',
  WORKER = 'worker',
  ACCOUNT_SYNC = 'accountSync',
}

registerEnumType(AdminPanelIndicatorHealthStatusInputEnum, {
  name: 'AdminPanelIndicatorHealthStatusInputEnum',
});

export class AdminPanelIndicatorHealthStatusInput {
  @Field(() => AdminPanelIndicatorHealthStatusInputEnum)
  indicatorName: AdminPanelIndicatorHealthStatusInputEnum;
}
