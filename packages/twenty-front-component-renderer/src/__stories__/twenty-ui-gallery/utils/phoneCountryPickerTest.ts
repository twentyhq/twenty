import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { createWaitForFrontComponentInteraction } from '@/__stories__/shared/test-utils/createWaitForFrontComponentInteraction';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const phoneCountryPickerTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  const waitForInteraction = createWaitForFrontComponentInteraction(
    canvasElement.ownerDocument.body,
  );
  await expectFrontComponentMounted(canvas);

  const primary = canvas.getByRole('button', { name: 'Primary phone country' });
  const secondary = canvas.getByRole('button', {
    name: 'Secondary phone country',
  });
  const disabled = canvas.getByRole('button', {
    name: 'Disabled phone country',
  });
  const primaryStatus = canvas.getByRole('status', {
    name: 'Primary phone country selection',
  });
  const secondaryStatus = canvas.getByRole('status', {
    name: 'Secondary phone country selection',
  });

  await userEvent.click(disabled);
  await waitForSandboxRoundTrip();
  expect(disabled).toHaveAttribute('aria-expanded', 'false');

  await userEvent.click(primary);
  await waitForInteraction(() =>
    expect(page.getByRole('option', { name: 'Japan (+81)' })).toBeVisible(),
  );
  const japan = page.getByRole('option', { name: 'Japan (+81)' });
  expect(japan).toBeDisabled();
  await userEvent.click(japan);
  await waitForSandboxRoundTrip();
  expect(primaryStatus).toHaveTextContent('Country: US; Changes: 0');
  expect(primary).toHaveAttribute('aria-expanded', 'true');

  expect(
    page.getByRole('listbox', { name: 'Primary phone countries' }),
  ).toBeVisible();
  const primarySearch = page.getByRole('searchbox', {
    name: 'Search primary phone country',
  });
  await userEvent.click(primarySearch);
  await waitForInteraction(() => expect(primarySearch).toHaveFocus());
  await userEvent.type(primarySearch, '+966');
  await waitForInteraction(() => expect(primarySearch).toHaveValue('+966'));
  await waitForInteraction(() => {
    const saudiArabia = page.getByRole('option', {
      name: 'المملكة العربية السعودية (+966)',
    });
    expect(saudiArabia).toBeVisible();
    expect(within(saudiArabia).getByText('+966')).toHaveAttribute('dir', 'ltr');
    const options = saudiArabia.closest('[data-phone-options="primary"]');
    expect(options?.tagName).toBe('SECTION');
    expect(options).toHaveAttribute('dir', 'rtl');
  });

  await userEvent.clear(primarySearch);
  await userEvent.type(primarySearch, ' +44 ');
  await waitForInteraction(() => expect(primarySearch).toHaveValue(' +44 '));
  await waitForInteraction(() => {
    expect(
      page.getByRole('option', { name: 'United Kingdom (+44)' }),
    ).toBeVisible();
    expect(
      page.queryByRole('option', { name: 'United States (+1)' }),
    ).toBeNull();
  });
  await userEvent.click(
    page.getByRole('option', { name: 'United Kingdom (+44)' }),
  );
  await waitForInteraction(() => {
    expect(primaryStatus).toHaveTextContent(
      'Country: GB; Changes: 1; Event: item-press/click; Refs: primary/primary',
    );
    expect(primary).toHaveAttribute('aria-expanded', 'false');
  });
  expect(primary).toHaveTextContent('🇬🇧');
  expect(secondary).toHaveTextContent('🇫🇷');

  await userEvent.click(
    canvas.getByRole('button', { name: 'Clear primary country' }),
  );
  await waitForInteraction(() => {
    expect(primaryStatus).toHaveTextContent('Country: none; Changes: 1');
    expect(primary).not.toHaveAccessibleDescription();
  });
  await userEvent.click(
    canvas.getByRole('button', { name: 'Set primary country to France' }),
  );
  await waitForInteraction(() => {
    expect(primaryStatus).toHaveTextContent('Country: FR; Changes: 1');
    expect(primary).toHaveAccessibleDescription('France');
  });

  await userEvent.click(secondary);
  await page.findByRole('listbox', { name: 'Secondary phone countries' });
  const secondarySearch = await page.findByRole('searchbox', {
    name: 'Search secondary phone country',
  });
  await userEvent.click(secondarySearch);
  await waitForInteraction(() => expect(secondarySearch).toHaveFocus());
  await userEvent.type(secondarySearch, ' gb ');
  await waitForInteraction(() => expect(secondarySearch).toHaveValue(' gb '));
  await userEvent.click(
    await page.findByRole('option', { name: 'United Kingdom (+44)' }),
  );
  await waitForInteraction(() => {
    expect(secondaryStatus).toHaveTextContent(
      'Country: FR; Changes: 0; Event: canceled/item-press',
    );
    expect(secondary).toHaveAttribute('aria-expanded', 'true');
  });
  expect(secondary).toHaveAccessibleDescription('France');

  await userEvent.clear(secondarySearch);
  await userEvent.type(secondarySearch, ' reunion ');
  await waitForInteraction(() =>
    expect(secondarySearch).toHaveValue(' reunion '),
  );
  await userEvent.click(
    await page.findByRole('option', { name: 'Réunion (+262)' }),
  );
  await waitForInteraction(() => {
    expect(secondaryStatus).toHaveTextContent(
      'Country: RE; Changes: 1; Event: item-press/click',
    );
    expect(secondary).toHaveAccessibleDescription('Réunion');
    expect(secondary).toHaveAttribute('aria-expanded', 'false');
  });
  expect(primary).toHaveAccessibleDescription('France');
  expect(errorHandler).not.toHaveBeenCalled();
};
