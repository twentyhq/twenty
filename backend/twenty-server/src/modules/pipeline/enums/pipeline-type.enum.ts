import { registerEnumType } from '@nestjs/graphql';

export enum PipelineType {
  NEW_BUSINESS = 'NEW_BUSINESS',
  RENEWALS = 'RENEWALS',
  UPSELL = 'UPSELL',
  PARTNER = 'PARTNER',
}

registerEnumType(PipelineType, {
  name: 'PipelineType',
  description: 'Type of sales pipeline',
});
