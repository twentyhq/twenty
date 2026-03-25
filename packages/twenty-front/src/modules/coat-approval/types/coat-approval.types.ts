export type CoatExportStatus =
  | 'NEEDS_APPROVAL'
  | 'READY_FOR_EXPORT'
  | 'DECLINED';

export type CoatTab = 'analyze' | 'all' | 'warnings';

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
  coatExportStatus: string | null;
  source: string | null;
  customerEmail: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerPhone: string | null;
  customerGender: string | null;
  customerBirthday: string | null;
  customerStreet: string | null;
  customerCity: string | null;
  customerPostcode: string | null;
  customerCountry: string | null;
  valueGrossBase: number | null;
  currencyBase: string | null;
  durationMonths: number | null;
  startDate: string | null;
  endDate: string | null;
  completionDate: string | null;
  paymentTerms: string | null;
  specialAgreements: string | null;
  closerEmail: string | null;
  bexioId: string | null;
};
