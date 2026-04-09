import { registerEnumType } from '@nestjs/graphql';

export enum LostReason {
  NO_BUDGET = 'NO_BUDGET',
  NO_NEED = 'NO_NEED',
  COMPETITOR = 'COMPETITOR',
  PRICING = 'PRICING',
  TIMING = 'TIMING',
  LOST_CONTACT = 'LOST_CONTACT',
  TECHNICAL_ISSUES = 'TECHNICAL_ISSUES',
  LEGAL_ISSUES = 'LEGAL_ISSUES',
  OTHER = 'OTHER',
}

registerEnumType(LostReason, {
  name: 'LostReason',
  description: 'Reason for losing a deal',
});
