export type SummarizeTargetKey = 'person' | 'company' | 'opportunity';

export type SummarizeTarget = {
  key: SummarizeTargetKey;
  label: string;
};

export const SUMMARIZE_TARGETS: Record<SummarizeTargetKey, SummarizeTarget> = {
  person: { key: 'person', label: 'person' },
  company: { key: 'company', label: 'company' },
  opportunity: { key: 'opportunity', label: 'opportunity' },
};
