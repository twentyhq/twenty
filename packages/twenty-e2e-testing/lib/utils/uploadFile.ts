import { Page } from '@playwright/test';
import path from 'path';

export const fileUploader = async (
  page: Page,
  trigger: () => Promise<void>,
  filename: string,
) => {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await trigger();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(
    path.join(__dirname, '..', 'test_files', filename),
  );
};
