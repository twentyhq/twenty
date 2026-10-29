import { isDefined } from 'twenty-shared/utils';

import { LOG_CONSOLE_TABLE_HTML_ID } from '@/log-console/constants/LogConsoleTableHtmlId';

export const updateLogConsoleTableCSSVariable = (
  cssVariableName: string,
  newValue: string | null,
) => {
  const tableElement = document.querySelector<HTMLDivElement>(
    `#${LOG_CONSOLE_TABLE_HTML_ID}`,
  );

  if (isDefined(newValue)) {
    tableElement?.style.setProperty(cssVariableName, newValue);
  } else {
    tableElement?.style.removeProperty(cssVariableName);
  }
};
