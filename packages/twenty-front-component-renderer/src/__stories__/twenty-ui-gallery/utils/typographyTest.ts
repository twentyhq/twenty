import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const typographyTest: TwentyUiGalleryPlayFunction = async (context) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const paragraph = canvas.getByTitle('Clamped paragraph');
  expect(paragraph.tagName).toBe('P');
  expect(getComputedStyle(paragraph).webkitLineClamp).toBe('2');
  expect(paragraph.scrollHeight).toBeGreaterThan(paragraph.clientHeight);
  const plainUrl = canvas.getByLabelText('Plain URL');
  expect(plainUrl.querySelector('a')).toBeNull();
  const link = canvas.getByRole('link', { name: 'Typography documentation' });
  expect(link).toHaveAttribute('data-ref-target', 'typography-link');
  expect(link.tagName).toBe('A');
  expect(link.scrollWidth).toBeGreaterThan(link.clientWidth);
  await userEvent.tab();
  await waitFor(() =>
    expect(canvas.getByLabelText('Typography link focuses')).toHaveTextContent(
      '1',
    ),
  );
  expect(link).toHaveFocus();

  await expect(
    canvas.getByRole('heading', { level: 1, name: 'Heading 1' }),
  ).toHaveAttribute('data-size', 'lg');
  await expect(
    canvas.getByRole('heading', { level: 3, name: 'Heading 3' }),
  ).toHaveAttribute('data-size', 'sm');
  await expect(
    canvas.getByRole('heading', { level: 2, name: 'Workspace preferences' }),
  ).toHaveAccessibleDescription('Manage the settings for your workspace.');

  await expect(
    canvas.getByRole('img', { name: 'Command + K' }),
  ).toHaveTextContent('⌘K');
  await expect(canvas.getByRole('img', { name: 'G next P' })).toHaveTextContent(
    'G next P',
  );
  await expect(canvas.getByText('Ctrl K')).toBeVisible();

  const hiddenAction = canvas.getByRole('button', {
    name: 'Add hidden record',
  });
  const hiddenLabel = canvas.getByTitle('Hidden action label');
  expect(hiddenAction).toHaveAccessibleDescription('Creates a contact');
  expect(hiddenLabel.tagName).toBe('SPAN');
  expect(hiddenLabel).toHaveAttribute('data-composed', 'hidden-label');
  expect(hiddenLabel).toHaveAttribute('data-ref-target', 'hidden-label');
  expect(getComputedStyle(hiddenLabel).position).toBe('absolute');
  expect(hiddenLabel.getBoundingClientRect().width).toBe(1);
  expect(hiddenLabel.getBoundingClientRect().height).toBe(1);
  await userEvent.click(hiddenAction);
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Hidden action activations'),
    ).toHaveTextContent('1'),
  );

  const section = canvas.getByRole('region', { name: 'Workspace settings' });
  await waitFor(() =>
    expect(section).toHaveAttribute('data-ref-tag', 'HTML-SECTION'),
  );
  const header = canvas.getByTitle('Workspace header');
  await waitFor(() =>
    expect(header).toHaveAttribute('data-ref-tag', 'HTML-HEADER'),
  );
  await expect(
    canvas.getByRole('heading', { name: 'Truncated description', level: 4 }),
  ).toHaveAttribute('data-size', 'lg');
  const description = canvas.getByText(/^Manage workspace preferences,/);
  await expect(description).not.toHaveAttribute('tabindex');
  await expect(getComputedStyle(description).webkitLineClamp).toBe('2');
  await expect(description.scrollHeight).toBeGreaterThan(
    description.clientHeight,
  );
  const fullDescription = canvas.getByText(/First line of full details/);
  await expect(fullDescription.textContent).toBe(
    'First line of full details\nSecond line of full details',
  );
  await expect(getComputedStyle(fullDescription).whiteSpace).toBe('pre-wrap');
  await expect(fullDescription).not.toHaveAttribute('tabindex');
  await expect(getComputedStyle(fullDescription).webkitLineClamp).toBe('none');
  await expect(
    canvas.getByRole('link', { name: 'Workspace documentation' }),
  ).toHaveAttribute('href', '#workspace');
  const focusableDescription = canvas.getByText('Focusable workspace details');
  await expect(focusableDescription).toHaveAttribute('tabindex', '0');
  focusableDescription.focus();
  await expect(focusableDescription).toHaveFocus();
  await waitFor(() =>
    expect(canvas.getByLabelText('Description focuses')).toHaveTextContent('1'),
  );

  const button = canvas.getByRole('button', { name: 'Edit workspace' });
  await userEvent.click(button);
  await waitFor(() =>
    expect(canvas.getByLabelText('Workspace edits')).toHaveTextContent('1'),
  );
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Workspace edits')).toHaveTextContent('2'),
  );
};
