import { Field, ID, ObjectType } from '@nestjs/graphql';

import { AppConnectionIdentificationStatus } from 'src/engine/core-modules/application/connection-provider/connections/enums/app-connection-identification-status.enum';

@ObjectType('IdentifyAppConnectionResult')
export class IdentifyAppConnectionResult {
  @Field(() => ID)
  connectedAccountId: string;

  @Field(() => AppConnectionIdentificationStatus)
  status: AppConnectionIdentificationStatus;
}
