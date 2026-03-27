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
  updatedAt: string | null;
  updatedBy: {
    source: string;
    workspaceMemberId: string | null;
    name: string;
  } | null;
  payment1Date: string | null;
  payment1Amount: number | null;
  payment2Date: string | null;
  payment2Amount: number | null;
  payment3Date: string | null;
  payment3Amount: number | null;
  payment4Date: string | null;
  payment4Amount: number | null;
  payment5Date: string | null;
  payment5Amount: number | null;
  payment6Date: string | null;
  payment6Amount: number | null;
  payment7Date: string | null;
  payment7Amount: number | null;
  payment8Date: string | null;
  payment8Amount: number | null;
  payment9Date: string | null;
  payment9Amount: number | null;
  payment10Date: string | null;
  payment10Amount: number | null;
  payment11Date: string | null;
  payment11Amount: number | null;
  payment12Date: string | null;
  payment12Amount: number | null;
  sendInvoiceEmail: boolean | null;
};
