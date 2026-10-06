import { isNonEmptyString } from '@sniptt/guards';
import { formatBytes, isDefined } from 'twenty-shared/utils';

import { formatAppDuration } from '@/app/format-app-duration';
import { type AppPlanSummary } from '@/app/deployment/types/app-plan.type';
import { type AppUploadProgress } from '@/app/deployment/types/app-upload-progress.type';
import { formatDataValue } from '@/data/format-data-value';
import { dimText, formatSuccessLine } from '@/output/style';

export const formatApplySummary = ({
  applicationName,
  apiUrl,
  summary,
  upload,
  isRegistrationCreated,
  clientGeneration,
  durationMilliseconds,
}: {
  applicationName: string;
  apiUrl: string;
  summary: AppPlanSummary | undefined;
  upload: AppUploadProgress;
  isRegistrationCreated: boolean;
  clientGeneration: 'generated' | 'skipped';
  durationMilliseconds: number;
}) => {
  const changes = isDefined(summary)
    ? `${summary.create} added · ${summary.update} changed · ${summary.delete} deleted`
    : 'changes not reported';
  const fileLabel = upload.fileCount === 1 ? 'file' : 'files';

  return [
    formatSuccessLine(
      `Applied ${formatDataValue(applicationName)} to ${apiUrl} ${dimText(`in ${formatAppDuration(durationMilliseconds)}`)}`,
    ),
    dimText(
      `  ${changes} · ${upload.fileCount} ${fileLabel} uploaded (${formatBytes(upload.byteCount)})`,
    ),
    isRegistrationCreated
      ? dimText('  Registered the app and installed it in this workspace.')
      : '',
    clientGeneration === 'generated'
      ? dimText('  Regenerated the typed API client.')
      : '',
  ]
    .filter(isNonEmptyString)
    .join('\n');
};
