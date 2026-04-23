import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PriceBookEntity,
  ProductPricingEntity,
  QuoteEntity,
  QuoteLineItemEntity,
} from './price-book.entity';
import { CPQService } from './price-book.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PriceBookEntity,
      ProductPricingEntity,
      QuoteEntity,
      QuoteLineItemEntity,
    ]),
  ],
  providers: [CPQService],
  exports: [CPQService],
})
export class CPQModule {}
