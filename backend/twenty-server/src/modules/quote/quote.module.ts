import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuoteService } from 'src/modules/quote/services/quote.service';
import { QuoteLineItemWorkspaceEntity } from 'src/modules/quote/standard-objects/quote-line-item.workspace-entity';
import { QuoteWorkspaceEntity } from 'src/modules/quote/standard-objects/quote.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuoteWorkspaceEntity,
      QuoteLineItemWorkspaceEntity,
    ]),
  ],
  providers: [QuoteService],
  exports: [QuoteService],
})
export class QuoteModule {}
