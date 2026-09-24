import { expect, userEvent, waitFor, within } from 'storybook/test';
import { THEME_DARK, THEME_LIGHT, themeCssVariables } from 'twenty-ui/theme';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

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
  expect(canvas.getByLabelText('Static theme color')).toHaveTextContent(
    THEME_LIGHT.font.color.primary,
  );
  expect(canvas.getByLabelText('Static spacing')).toHaveTextContent('12px');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Use dark values' }),
  );
  await waitFor(() => {
    expect(canvas.getByLabelText('Static color scheme')).toHaveTextContent(
      'dark',
    );
    expect(canvas.getByLabelText('Static theme color')).toHaveTextContent(
      THEME_DARK.font.color.primary,
    );
  });
  const hostColor = canvas.getByLabelText('Host theme color');
  expect(hostColor).toHaveTextContent(themeCssVariables.font.color.primary);
  const root = canvasElement.ownerDocument.documentElement;
  const originalClassName = root.className;
  try {
    root.classList.remove('dark');
    root.classList.add('light');
    const lightColor = getComputedStyle(hostColor).color;
    root.classList.remove('light');
    root.classList.add('dark');
    await waitFor(() =>
      expect(getComputedStyle(hostColor).color).not.toBe(lightColor),
    );
    expect(hostColor).toHaveTextContent(themeCssVariables.font.color.primary);
  } finally {
    root.className = originalClassName;
  }
  expect(errorHandler).not.toHaveBeenCalled();
};
