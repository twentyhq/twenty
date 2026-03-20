export type CoatExportStatus =
  | 'NEEDS_APPROVAL'
  | 'READY_FOR_EXPORT'
  | 'DECLINED';

export type CoatFilterValues = {
  searchTerm: string;
  exportStatus: string;
  programName: string;
  dateFrom: string;
  dateTo: string;
};

export type CoatContractRecord = {
  id: string;
  name: string;
  createdAt: string;
  contractId: string | null;
  contractName: string | null;
  contractType: string | null;
  program: string | null;
  programId: string | null;
  status: string | null;
  customerEmail: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;
  valueGrossBase: number | null;
  currencyBase: string | null;
  startDate: string | null;
  endDate: string | null;
  completionDate: string | null;
  bexioId: string | null;
  source: string | null;
  durationMonths: number | null;
};
