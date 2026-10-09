import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const tagControlsTest: TwentyUiGalleryPlayFunction = async (context) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const defaultTag = canvas.getByTitle('Default tag with handler');

  expect(defaultTag.tagName).toBe('SPAN');
  expect(defaultTag).toHaveAttribute('data-ref-target', 'default-tag');
  expect(defaultTag).not.toHaveAttribute('role');
  expect(defaultTag).not.toHaveAttribute('tabindex');
  expect(defaultTag).not.toHaveAttribute('data-interactive');
  await userEvent.click(defaultTag);
  await waitFor(() =>
    expect(canvas.getByLabelText('Default tag activations')).toHaveTextContent(
      '1',
    ),
  );

  const button = canvas.getByRole('button', { name: 'Open tag' });

  expect(button.tagName).toBe('BUTTON');
  expect(button).toHaveAttribute('type', 'button');
  expect(button).toHaveAttribute('data-ref-target', 'tag-button');
  expect(button).toHaveAttribute('data-render-ref-target', 'tag-button');
  await userEvent.click(button);
  button.focus();
  await userEvent.keyboard('{Enter} ');
  await waitFor(() => {
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('3');
    expect(canvas.getByLabelText('Tag focuses')).toHaveTextContent('1');
  });
  expect(button).toHaveFocus();

  const disabledButton = canvas.getByRole('button', { name: 'Disabled tag' });

  expect(disabledButton).toBeDisabled();
  await userEvent.click(disabledButton);
  expect(canvas.getByLabelText('Activations')).toHaveTextContent('3');

  const link = canvas.getByRole('link', { name: 'Tag documentation' });

  expect(link.tagName).toBe('A');
  expect(link).toHaveAttribute('href', '#tag-documentation');
  expect(link).toHaveAttribute('target', '_self');
  expect(link).toHaveAttribute('data-ref-target', 'tag-link');
  expect(link).toHaveAttribute('data-render-ref-target', 'tag-link');
  button.focus();
  await userEvent.tab();
  expect(link).toHaveFocus();
  await userEvent.click(link);
  link.focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Tag link activations')).toHaveTextContent(
      '2',
    ),
  );
  expect(link).toHaveFocus();

  const nodeLink = canvas.getByRole('link', { name: 'Intentional tag link' });

  expect(nodeLink).toHaveAttribute('href', '#tag-records');
  expect(nodeLink.parentElement?.parentElement?.tagName).toBe('SPAN');
  expect(nodeLink.parentElement?.parentElement).toHaveStyle({ padding: '0px' });
  expect(canvas.getByText('Static tag')).toBeVisible();

  const truncatedText = canvas.getByText(
    'A long tag label that should truncate',
  );
  const fullTag = canvas.getByTitle('Full tag');
  const fullText = canvas.getByText('A long tag label shown in full');

  await waitFor(() => {
    expect(getComputedStyle(truncatedText).textOverflow).toBe('ellipsis');
    expect(truncatedText.scrollWidth).toBeGreaterThan(
      truncatedText.clientWidth,
    );
  });
  expect(fullTag).not.toHaveAttribute('data-truncate');
  expect(getComputedStyle(fullText).textOverflow).toBe('clip');
  expect(fullText.scrollWidth).toBe(fullText.clientWidth);
  expect(fullText).not.toHaveAttribute('tabindex');
  expect(errorHandler).not.toHaveBeenCalled();
};
