import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const collapsibleTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const trigger = await canvas.findByRole(
    'button',
    { name: 'Controlled details' },
    { timeout: MOUNT_TIMEOUT },
  );
  const root = canvas.getByRole('region', { name: 'Controlled collapsible' });
  const panel = within(root).getByRole('article', { hidden: true });
  expect(root.tagName).toBe('SECTION');
  expect(root).toHaveAttribute('data-ref-target', 'collapsible-root');
  expect(trigger).toHaveAttribute('data-ref-target', 'collapsible-trigger');
  expect(panel).toHaveAttribute('data-ref-target', 'collapsible-panel');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(panel).not.toBeVisible();
  expect(panel.getBoundingClientRect().height).toBe(0);

  await userEvent.click(trigger);
  await waitFor(() => {
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toBeVisible();
    expect(canvas.getByRole('article', { name: 'Controlled panel' })).toBe(
      panel,
    );
    expect(panel).toHaveClass('open-panel');
    expect(panel).toHaveAttribute('data-render-open', 'true');
    expect(panel).toHaveStyle({ padding: '7px' });
    expect(
      canvas.getByText('Changes: 1, reason: trigger-press, clicks: 1'),
    ).toBeVisible();
  });

  await userEvent.keyboard(' ');
  await waitFor(() => {
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toBeVisible();
    expect(panel.getBoundingClientRect().height).toBe(0);
    expect(
      canvas.getByText('Changes: 2, reason: trigger-press, clicks: 2'),
    ).toBeVisible();
  });

  await userEvent.click(
    canvas.getByRole('button', { name: 'Toggle controlled details' }),
  );
  await waitFor(() => expect(panel).toBeVisible());
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(
    canvas.getByText('Changes: 2, reason: trigger-press, clicks: 2'),
  ).toBeVisible();

  const uncontrolled = canvas.getByRole('button', {
    name: 'Uncontrolled details',
  });
  expect(uncontrolled).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(uncontrolled);
  await waitFor(() =>
    expect(
      canvas.queryByText('Uncontrolled expandable content'),
    ).not.toBeInTheDocument(),
  );
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByText('Uncontrolled expandable content')).toBeVisible(),
  );
  expect(uncontrolled).toHaveAttribute('aria-expanded', 'true');

  const disabled = canvas.getByRole('button', { name: 'Disabled details' });
  expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(disabled);
  expect(disabled).toHaveAttribute('aria-expanded', 'false');
  expect(
    canvas.queryByText('Disabled expandable content'),
  ).not.toBeInTheDocument();
};
