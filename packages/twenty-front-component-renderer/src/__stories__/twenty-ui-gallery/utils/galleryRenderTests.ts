import { expect, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createGalleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/createGalleryRenderTest';

export const galleryRenderTest = createGalleryRenderTest({
  expectedFailedComponents: [],
});

// LinkChip crashes without a router context in the sandbox.
export const dataDisplayTest = createGalleryRenderTest({
  expectedFailedComponents: ['LinkChip'],
});

// Base UI 1.8 radios require Element.matches(':disabled'),
// which the sandbox DOM does not implement.
export const inputReactTest = createGalleryRenderTest({
  expectedFailedComponents: ['CardPicker', 'Radio', 'RadioGroup'],
});
export const inputPreactTest = createGalleryRenderTest({
  expectedFailedComponents: ['CardPicker'],
});

// react-router Links crash without a router context.
export const navigationTest = createGalleryRenderTest({
  expectedFailedComponents: ['RawLink', 'UndecoratedLink'],
});

// An open Modal portal hangs the React render without an error, so the
// missing gallery status is the only observable failure. Preact can mount it.
export const modalOpenHangTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);

  await expect(
    canvas.findByTestId('gallery-status', {}, { timeout: 10000 }),
  ).rejects.toThrow();
};

// Monaco cannot load scripts inside the sandbox worker, so the wrapper mounts
// but the editor's onMount never fires.
export const codeEditorTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);

  const codeEditor = await canvas.findByTestId(
    'code-editor-component',
    {},
    { timeout: MOUNT_TIMEOUT },
  );

  await new Promise((resolve) => setTimeout(resolve, 5000));

  expect(codeEditor).toHaveAttribute('data-monaco-mount-state', 'pending');
};

export const themeTokenTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);

  const iconWrapper = await canvas.findByTestId(
    'theme-token-icon-wrapper',
    {},
    { timeout: MOUNT_TIMEOUT },
  );

  await waitFor(() => {
    const iconBox = iconWrapper.getBoundingClientRect();

    expect(Math.round(iconBox.width)).toBe(16);
    expect(Math.round(iconBox.height)).toBe(16);
  });

  expect(errorHandler).not.toHaveBeenCalled();
};

export const displayHelpersTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const truncatedText = canvas.getByText(
    'A long account name that should truncate',
  );
  const clampedText = canvas.getByText(/A longer account description/);

  expect(truncatedText.tagName).toBe('P');
  await waitFor(() => {
    expect(getComputedStyle(truncatedText).textOverflow).toBe('ellipsis');
    expect(truncatedText.scrollWidth).toBeGreaterThan(
      truncatedText.clientWidth,
    );
    expect(getComputedStyle(clampedText).webkitLineClamp).toBe('2');
  });
  expect(canvas.getByText('An overflowing reference number')).toBeVisible();
  expect(canvas.getByText('1234.5')).toBeVisible();
  expect(canvas.getByText('{"active":true}')).toBeVisible();
  expect(canvas.getByText('Account description')).toBeVisible();
  expect(canvas.getByText('Qualified')).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};
