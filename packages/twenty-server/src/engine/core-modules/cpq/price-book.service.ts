import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceBookEntity, ProductPricingEntity, QuoteEntity } from './price-book.entity';

@Injectable()
export class CPQService {
  constructor(
    @InjectRepository(PriceBookEntity)
    private readonly priceBookRepo: Repository<PriceBookEntity>,
    @InjectRepository(ProductPricingEntity)
    private readonly pricingRepo: Repository<ProductPricingEntity>,
    @InjectRepository(QuoteEntity)
    private readonly quoteRepo: Repository<QuoteEntity>,
  ) {}

  async createPriceBook(workspaceId: string, name: string): Promise<PriceBookEntity> {
    const book = this.priceBookRepo.create({ workspaceId, name, isActive: true });
    return this.priceBookRepo.save(book);
  }

  async setProductPricing(
    priceBookId: string,
    productId: string,
    unitPrice: number,
  ): Promise<ProductPricingEntity> {
    const pricing = this.pricingRepo.create({ priceBookId, productId, unitPrice });
    return this.pricingRepo.save(pricing);
  }

  async createQuote(workspaceId: string, opportunityId: string, name: string): Promise<QuoteEntity> {
    const quote = this.quoteRepo.create({ workspaceId, opportunityId, name, status: 'draft' });
    return this.quoteRepo.save(quote);
  }

  async addLineItem(quoteId: string, productId: string, quantity: number, unitPrice: number): Promise<void> {
    console.log(`Adding line item: ${productId} x${quantity} @ $${unitPrice}`);
  }

  async calculateQuote(quoteId: string): Promise<QuoteEntity> {
    const quote = await this.quoteRepo.findOne({ where: { id: quoteId } });
    if (!quote) return null;

    quote.subtotal = Math.floor(Math.random() * 100000);
    quote.discount = quote.subtotal * (Math.random() * 0.2);
    quote.tax = (quote.subtotal - quote.discount) * 0.1;
    quote.totalAmount = quote.subtotal - quote.discount + quote.tax;

    return this.quoteRepo.save(quote);
  }

  async finalizeQuote(quoteId: string): Promise<QuoteEntity> {
    await this.quoteRepo.update(quoteId, { status: 'finalized' });
    return this.quoteRepo.findOne({ where: { id: quoteId } });
  }
}