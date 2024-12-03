import { Locator, Page } from '@playwright/test';
import { selectAllByKeyboard } from './keyboardShortcuts';

// https://github.com/microsoft/playwright/issues/14126
// code must have \n at the end of lines otherwise everything will be in one line
export const pasteCodeToCodeEditor = async (
  page: Page,
  locator: Locator,
  code: string,
) => {
  await locator.click();
  await selectAllByKeyboard(page);
  await page.keyboard.type(code);
};
