export type BankConnectionStatus =
  | 'connected'
  | 'syncing'
  | 'error'
  | 'disconnected'
  | 'pending_auth';

export type ReconciliationStatus =
  | 'matched'
  | 'unmatched'
  | 'partial_match'
  | 'excluded';

export type PaymentFileFormat =
  | 'ach'
  | 'spei'
  | 'pse'
  | 'sepa'
  | 'swift';

export type BankConnection = {
  id: string;
  bankName: string;
  bankLogo: string | null;
  accountNumber: string;
  accountType: string;
  currency: string;
  balance: number;
  status: BankConnectionStatus;
  lastSyncAt: string | null;
  errorMessage: string | null;
};

export type BankTransaction = {
  id: string;
  bankConnectionId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference: string | null;
  reconciliationStatus: ReconciliationStatus;
  matchedInvoiceId: string | null;
  matchedInvoiceNumber: string | null;
};

export type PaymentFile = {
  id: string;
  format: PaymentFileFormat;
  fileName: string;
  totalAmount: number;
  currency: string;
  transactionCount: number;
  status: 'draft' | 'generated' | 'submitted' | 'processed';
  createdAt: string;
  generatedAt: string | null;
};
