import { Module } from '@nestjs/common';

import { LeadScoringService } from 'src/modules/lead-scoring/services/lead-scoring.service';

@Module({
  providers: [LeadScoringService],
  exports: [LeadScoringService],
})
export class LeadScoringModule {}
