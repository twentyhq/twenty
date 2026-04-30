export type PRStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'ordered';

export type PurchaseRequest = {
  id: string;
  title: string;
  requester: string;
  department: string;
  status: PRStatus;
  totalAmount: number;
  currency: string;
  submittedAt: string;
  approver: string;
};

export type SupplierQuote = {
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  leadTimeDays: number;
  warranty: string;
  rating: number;
  currency: string;
};

export type RFQData = {
  id: string;
  itemName: string;
  quantity: number;
  quotes: SupplierQuote[];
};

export type SpendCategory = {
  category: string;
  amount: number;
  percentage: number;
  currency: string;
};
