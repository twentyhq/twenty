import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

// TODO: Verify field names match the actual tobContract object schema in Twenty
export const COAT_DETAIL_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  customerName: true,
  customerEmail: true,
  programName: true,
  status: true,
  signatureDate: true,
  paymentAgreement: true,
  errorCode: true,
  billingAddress: true,
  paymentPlan: true,
  contractId: true,
  internalContractId: true,
  docusealUrl: true,
};
