import { isDefined } from 'twenty-shared/utils';

import { type ToolingDiagnostic } from '@/app/types/tooling-result.type';
import { dimText, formatFailureLine, formatWarningLine } from '@/output/style';

export const formatToolingDiagnostic = ({
  severity,
  code,
  message,
  file,
  line,
  column,
}: ToolingDiagnostic) => {
  const location = isDefined(file)
    ? [file, line, column].filter(isDefined).join(':')
    : undefined;
  const text = [location, dimText(code, process.stderr), message]
    .filter(isDefined)
    .join('  ');

  return severity === 'error'
    ? formatFailureLine(text)
    : formatWarningLine(text);
};
