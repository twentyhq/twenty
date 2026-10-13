import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { type TrackedJob } from 'src/engine/core-modules/tracked-job/types/tracked-job.type';

export type RecordExport = TrackedJob & {
  requestTokenHash: string;
  parameters: RecordExportParameters;
  filename: string;
};
