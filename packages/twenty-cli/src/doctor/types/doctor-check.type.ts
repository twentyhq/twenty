export type DoctorCheck = {
  id: string;
  status: 'pass' | 'warning' | 'fail' | 'skipped';
  message: string;
  code?: string;
  hint?: string;
  details?: Record<string, unknown>;
};
