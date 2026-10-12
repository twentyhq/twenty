import { CORE_WORKFLOW_RUN_FIELD_DISPLAY_OVERRIDES } from '@/object-core/workflows/constants/CoreWorkflowRunFieldDisplayOverrides';
import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';

export const RECORD_FIELD_DISPLAY_OVERRIDES: RecordFieldDisplayOverride[] = [
  ...CORE_WORKFLOW_RUN_FIELD_DISPLAY_OVERRIDES,
];
