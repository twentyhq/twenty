export type PriceBookData = {
  id: string;
  name: string;
  currency: string;
  productCount: number;
  effectiveDate: string;
  expirationDate: string;
  isActive: boolean;
};

export type QuoteLineItem = {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
};

export type QuoteData = {
  id: string;
  quoteNumber: string;
  accountName: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  validUntil: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  createdAt: string;
};
