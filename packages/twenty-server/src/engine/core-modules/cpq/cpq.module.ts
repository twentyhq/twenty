import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceBookEntity, ProductPricingEntity, QuoteEntity } from './price-book.entity';
import { CPQService } from './price-book.service';

@Module({
  imports: [TypeOrmModule.forFeature([PriceBookEntity, ProductPricingEntity, QuoteEntity])],
  providers: [CPQService],
  exports: [CPQService],
})
export class CPQModule {}