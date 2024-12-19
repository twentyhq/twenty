import { Module } from '@nestjs/common';

import { CompanyEnrichmentService } from './company-enrichment.service';

@Module({
  providers: [CompanyEnrichmentService],
  exports: [CompanyEnrichmentService],
})
export class CompanyEnrichmentModule {}
