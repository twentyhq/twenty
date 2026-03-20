// TODO: Verify exact field names against the tobContract object in Twenty once available.
// The field names below are based on the COAT Workshop app columns and may need adjustment.

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
  customerName: string | null;
  customerEmail: string | null;
  programName: string | null;
  // TODO: Confirm the exact field name for export status on the tobContract object
  status: string | null;
  signatureDate: string | null;
  paymentAgreement: string | null;
  errorCode: string | null;
};

export type CoatContractDetailRecord = CoatContractRecord & {
  billingAddress: string | null;
  paymentPlan: string | null;
  contractId: string | null;
  internalContractId: string | null;
  docusealUrl: string | null;
};
