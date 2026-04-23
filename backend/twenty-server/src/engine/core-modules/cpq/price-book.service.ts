import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PriceBookEntity,
  ProductPricingEntity,
  QuoteEntity,
  QuoteLineItemEntity,
} from './price-book.entity';

@Injectable()
export class CPQService {
  constructor(
    @InjectRepository(PriceBookEntity)
    private readonly priceBookRepo: Repository<PriceBookEntity>,
    @InjectRepository(ProductPricingEntity)
    private readonly pricingRepo: Repository<ProductPricingEntity>,
    @InjectRepository(QuoteEntity)
    private readonly quoteRepo: Repository<QuoteEntity>,
    @InjectRepository(QuoteLineItemEntity)
    private readonly lineItemRepo: Repository<QuoteLineItemEntity>,
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

  async addLineItem(
    quoteId: string,
    productId: string,
    quantity: number,
    unitPrice: number,
    options: {
      name?: string;
      discountRate?: number;
      taxRate?: number;
      metadata?: Record<string, unknown>;
    } = {},
  ): Promise<QuoteLineItemEntity> {
    const discountRate = options.discountRate ?? 0;
    const taxRate = options.taxRate ?? 0.19;
    const grossAmount = quantity * unitPrice;
    const discountAmount = grossAmount * discountRate;
    const taxableAmount = grossAmount - discountAmount;
    const taxAmount = taxableAmount * taxRate;

    const lineItem = this.lineItemRepo.create({
      quoteId,
      productId,
      name: options.name,
      quantity,
      unitPrice,
      discountRate,
      discountAmount,
      taxRate,
      taxAmount,
      lineTotal: taxableAmount + taxAmount,
      metadata: options.metadata ?? {},
    });

    const savedLineItem = await this.lineItemRepo.save(lineItem);
    await this.calculateQuote(quoteId);

    return savedLineItem;
  }

  async getLineItems(quoteId: string): Promise<QuoteLineItemEntity[]> {
    return this.lineItemRepo.find({
      where: { quoteId },
      order: { createdAt: 'ASC' },
    });
  }

  async calculateQuote(quoteId: string): Promise<QuoteEntity> {
    const quote = await this.quoteRepo.findOne({ where: { id: quoteId } });
    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    const lineItems = await this.getLineItems(quoteId);
    const subtotal = lineItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    );
    const discount = lineItems.reduce((sum, item) => sum + Number(item.discountAmount), 0);
    const tax = lineItems.reduce((sum, item) => sum + Number(item.taxAmount), 0);

    quote.subtotal = subtotal;
    quote.discount = discount;
    quote.tax = tax;
    quote.totalAmount = subtotal - discount + tax;

    return this.quoteRepo.save(quote);
  }

  async finalizeQuote(quoteId: string): Promise<QuoteEntity> {
    await this.calculateQuote(quoteId);
    await this.quoteRepo.update(quoteId, { status: 'finalized' });
    const quote = await this.quoteRepo.findOne({ where: { id: quoteId } });
    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }
    return quote;
  }

  async removeLineItem(quoteId: string, lineItemId: string): Promise<void> {
    await this.lineItemRepo.delete({ id: lineItemId, quoteId });
    await this.calculateQuote(quoteId);
  }
}
