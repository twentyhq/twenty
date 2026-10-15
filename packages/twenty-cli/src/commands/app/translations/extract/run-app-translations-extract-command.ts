import { isArray, isNumber, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { createToolingFailure } from '@/app/create-tooling-failure';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { parseToolingResult } from '@/app/parse-tooling-result';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { runAppWorker } from '@/app/run-app-worker';
import { toWorkerOutputDiagnostics } from '@/app/to-worker-output-diagnostics';
import { parseExtractionLocale } from '@/app/translations/parse-extraction-locale';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { formatSuccessLine } from '@/output/style';

export const runAppTranslationsExtractCommand: CommandRun = async (context) => {
  const { options, output, outputMode, signal } = context;
  const locale = parseExtractionLocale(readStringOption(options, 'locale'));
  const project = await resolveAppProject({
    explicitPath: readStringOption(options, 'path'),
    workingDirectory: process.cwd(),
  });
  const sdk = await resolveSourceSdk({ appPath: project.path });

  output.progress({
    message: `Extracting translatable strings from ${project.name}…`,
  });
  const worker = await runAppWorker({
    request: { type: 'extractTranslations', appPath: project.path, locale },
    signal,
  });
  const result = parseToolingResult({
    value: worker.result,
    parseData: (value) => {
      if (
        !isPlainObject(value) ||
        !isNumber(value.sourceCount) ||
        !isArray(value.updatedLocaleFiles) ||
        !value.updatedLocaleFiles.every(isString)
      ) {
        return;
      }
      return {
        data: {
          sourceCount: value.sourceCount,
          updatedLocaleFiles: value.updatedLocaleFiles,
        },
      };
    },
  });
  const diagnostics = [
    ...result.diagnostics,
    ...toWorkerOutputDiagnostics(worker.output),
  ];

  if (outputMode === 'human') {
    for (const diagnostic of diagnostics) {
      output.progress({ message: formatToolingDiagnostic(diagnostic) });
    }
  }
  if (!result.success) {
    throw createToolingFailure({
      error: result.error,
      diagnostics,
      sdkVersion: sdk.version,
    });
  }

  return {
    data: { app: project, ...result.data, diagnostics },
    human: [
      formatSuccessLine(
        `Extracted ${result.data.sourceCount} ${result.data.sourceCount === 1 ? 'string' : 'strings'} to locales/`,
      ),
      `Updated: ${result.data.updatedLocaleFiles.join(', ')}`,
    ].join('\n'),
  };
};
