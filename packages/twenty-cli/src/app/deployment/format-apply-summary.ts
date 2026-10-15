import { isNonEmptyString } from '@sniptt/guards';
import { formatBytes, isDefined } from 'twenty-shared/utils';

import { formatAppDuration } from '@/app/format-app-duration';
import { formatTranslationSummary } from '@/app/deployment/format-translation-summary';
import {
  type AppPlanSummary,
  type AppTranslationPlanAction,
} from '@/app/deployment/types/app-plan.type';
import { type AppUploadProgress } from '@/app/deployment/types/app-upload-progress.type';
import { formatDataValue } from '@/data/format-data-value';
import { colorText, dimText, formatSuccessLine } from '@/output/style';

const formatChangeCount = ({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: 'green' | 'yellow' | 'red';
}) => {
  const text = `${count} ${label}`;

  return count === 0 ? dimText(text) : colorText(color, text);
};

export const formatApplySummary = ({
  applicationName,
  apiUrl,
  summary,
  translationActions,
  upload,
  isRegistrationCreated,
  clientGeneration,
  durationMilliseconds,
}: {
  applicationName: string;
  apiUrl: string;
  summary: AppPlanSummary | undefined;
  translationActions: AppTranslationPlanAction[] | null;
  upload: AppUploadProgress;
  isRegistrationCreated: boolean;
  clientGeneration: 'generated' | 'skipped';
  durationMilliseconds: number;
}) => {
  const changes = isDefined(summary)
    ? [
        formatChangeCount({
          count: summary.create,
          label: 'added',
          color: 'green',
        }),
        formatChangeCount({
          count: summary.update,
          label: 'changed',
          color: 'yellow',
        }),
        formatChangeCount({
          count: summary.delete,
          label: 'deleted',
          color: 'red',
        }),
      ].join(dimText(' · '))
    : dimText('changes not reported');
  const fileLabel = upload.fileCount === 1 ? 'file' : 'files';

  return [
    formatSuccessLine(
      `Applied ${formatDataValue(applicationName)} to ${apiUrl} ${dimText(`in ${formatAppDuration(durationMilliseconds)}`)}`,
    ),
    `  ${changes}${dimText(` · ${upload.fileCount} ${fileLabel} uploaded (${formatBytes(upload.byteCount)})`)}`,
    translationActions?.length
      ? `  ${formatTranslationSummary(translationActions)}`
      : '',
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
