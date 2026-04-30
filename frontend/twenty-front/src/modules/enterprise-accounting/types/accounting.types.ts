export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type AccountData = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  parentId?: string;
  children?: AccountData[];
};

export type JournalEntryLine = {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
};

export type JournalEntry = {
  id: string;
  date: string;
  description: string;
  lines: JournalEntryLine[];
  createdBy: string;
  status: 'draft' | 'posted' | 'voided';
};

export type FinancialPeriod = {
  label: string;
  startDate: string;
  endDate: string;
};

export type FinancialLineItem = {
  label: string;
  amount: number;
  isTotal?: boolean;
};
