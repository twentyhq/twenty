import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';

registerEnumType(CampaignEngagementActivityFilter, {
  name: 'CampaignEngagementActivityFilter',
});

@InputType()
export class MessageCampaignEngagementInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageCampaignId: string;

  @Field(() => CampaignEngagementActivityFilter, {
    nullable: true,
    defaultValue: CampaignEngagementActivityFilter.FILTERED,
  })
  @IsOptional()
  @IsEnum(CampaignEngagementActivityFilter)
  activityFilter?: CampaignEngagementActivityFilter;
}
