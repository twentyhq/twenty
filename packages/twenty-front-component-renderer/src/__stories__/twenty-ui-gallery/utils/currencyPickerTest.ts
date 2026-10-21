import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const currencyPickerTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  const primaryTrigger = canvas.getByRole('button', {
    name: 'Primary currency',
  });
  const secondaryTrigger = canvas.getByRole('button', {
    name: 'Secondary currency',
  });
  const disabledTrigger = canvas.getByRole('button', {
    name: 'Disabled currency',
  });
  const savedCurrencies = canvas.getByRole('status', {
    name: 'Saved currencies',
  });
  const currencyChanges = canvas.getByRole('status', {
    name: 'Primary currency changes',
  });

  expect(primaryTrigger.tagName).toBe('BUTTON');
  expect(primaryTrigger).toHaveAttribute('data-currency-trigger', 'primary');
  expect(primaryTrigger).toHaveTextContent('EUR');
  expect(secondaryTrigger).toHaveTextContent('USD');
  expect(disabledTrigger).toBeDisabled();
  await userEvent.click(disabledTrigger);
  expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false');
  expect(
    page.queryByRole('dialog', { name: 'Disabled currencies' }),
  ).toBeNull();

  await userEvent.click(primaryTrigger);
  const primarySearch = await page.findByRole('searchbox', {
    name: 'Search primary currencies',
  });
  const yen = await page.findByRole('option', { name: 'Japanese Yen (JPY)' });
  expect(yen.tagName).toBe('BUTTON');
  expect(yen).toBeDisabled();
  await userEvent.click(yen);
  await waitForSandboxRoundTrip();
  expect(savedCurrencies).toHaveTextContent('Primary: EUR; Secondary: USD');
  expect(currencyChanges).toHaveTextContent('Changes: 0; Reason: none');

  await userEvent.type(primarySearch, 'zzzz');
  await waitForSandboxRoundTrip();
  expect(primarySearch).toHaveValue('zzzz');
  await waitFor(() =>
    expect(page.getByText('No matching currencies')).toBeVisible(),
  );
  await userEvent.clear(primarySearch);
  await userEvent.type(primarySearch, '$');
  await waitForSandboxRoundTrip();
  expect(primarySearch).toHaveValue('$');
  const canadianDollar = await page.findByRole('option', {
    name: 'Canadian Dollar (CAD)',
  });
  await waitFor(() =>
    expect(page.queryByRole('option', { name: 'Euro (EUR)' })).toBeNull(),
  );
  await userEvent.click(canadianDollar);
  await waitFor(() => {
    expect(savedCurrencies).toHaveTextContent('Primary: CAD; Secondary: USD');
    expect(currencyChanges).toHaveTextContent(
      'Changes: 1; Reason: item-press; Trigger: primary',
    );
    expect(primaryTrigger).toHaveAttribute('aria-expanded', 'false');
  });
  expect(primaryTrigger).toHaveTextContent('CAD');

  await userEvent.click(secondaryTrigger);
  const secondarySearch = await page.findByRole('searchbox', {
    name: 'Search secondary currencies',
  });
  await userEvent.type(secondarySearch, 'euro');
  await waitForSandboxRoundTrip();
  expect(secondarySearch).toHaveValue('euro');
  await userEvent.click(
    await page.findByRole('option', { name: 'Euro (EUR)' }),
  );
  await waitFor(() => {
    expect(savedCurrencies).toHaveTextContent('Primary: CAD; Secondary: EUR');
    expect(secondaryTrigger).toHaveAttribute('aria-expanded', 'false');
  });
  expect(secondaryTrigger).toHaveTextContent('EUR');
  expect(primaryTrigger).toHaveTextContent('CAD');

  await userEvent.click(
    canvas.getByRole('button', { name: 'Clear primary currency' }),
  );
  await waitFor(() => expect(primaryTrigger).toHaveTextContent('None'));
  await userEvent.click(primaryTrigger);
  const reopenedSearch = await page.findByRole('searchbox', {
    name: 'Search primary currencies',
  });
  expect(reopenedSearch).toHaveValue('');
  expect(page.queryByRole('option', { selected: true })).toBeNull();
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(primaryTrigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await waitFor(() => expect(primaryTrigger).toHaveFocus());

  await userEvent.click(
    canvas.getByRole('button', { name: 'Use USD for primary' }),
  );
  await waitFor(() => expect(primaryTrigger).toHaveTextContent('USD'));
  await userEvent.click(primaryTrigger);
  expect(
    await page.findByRole('option', { name: 'US Dollar (USD)' }),
  ).toHaveAttribute('aria-selected', 'true');
  expect(currencyChanges).toHaveTextContent('Changes: 1; Reason: item-press');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(primaryTrigger).toHaveFocus());
  expect(errorHandler).not.toHaveBeenCalled();
};
