export type ContractStatus = 'draft' | 'in_review' | 'approved' | 'active' | 'expired' | 'terminated';

export type ContractData = {
  id: string;
  title: string;
  counterparty: string;
  status: ContractStatus;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  owner: string;
};

export type RedlineEntry = {
  id: string;
  version: number;
  author: string;
  timestamp: string;
  changesSummary: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export type Obligation = {
  id: string;
  contractId: string;
  description: string;
  dueDate: string;
  responsible: string;
  completed: boolean;
};
