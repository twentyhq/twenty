import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

export const JUSTUS_TRUTH_REVIEW_GQL_FIELDS: RecordGqlOperationGqlRecordFields =
  {
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    truthText: true,
    domain: true,
    claimType: true,
    sourceContext: true,
    status: true,
    evidenceCount: true,
    contextSummary: true,
    sourceDate: true,
    meetingTopic: true,
    confidence: true,
    truthForm: true,
    approvedBy: true,
    approvedAt: true,
  };

export const JUSTUS_TRUTH_LIST_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  truthText: true,
  domain: true,
  claimType: true,
  status: true,
  evidenceCount: true,
  approvedBy: true,
};
