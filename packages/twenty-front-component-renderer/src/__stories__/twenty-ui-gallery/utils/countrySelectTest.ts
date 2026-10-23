import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { createWaitForFrontComponentInteraction } from '@/__stories__/shared/test-utils/createWaitForFrontComponentInteraction';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

type Canvas = ReturnType<typeof within>;

const BILLING_COUNTRY_TRIGGER_NAME = 'Billing country';

const expectTriggersShowSavedCountriesWithDecorativeFlags = (
  canvas: Canvas,
) => {
  const billingTrigger = canvas.getByRole('button', {
    name: BILLING_COUNTRY_TRIGGER_NAME,
  });
  const shippingTrigger = canvas.getByRole('button', {
    name: 'Shipping country',
  });

  expect(billingTrigger).toHaveTextContent('France');
  expect(shippingTrigger).toHaveTextContent('Japon');
  expect(billingTrigger.tagName).toBe('BUTTON');
  expect(billingTrigger).toHaveAttribute('title', 'Choose a billing country');
  expect(billingTrigger).toHaveAttribute('data-ref-target', 'billing-country');
  expect(billingTrigger).toHaveAttribute(
    'data-render-target',
    'billing-country',
  );
  expect(within(billingTrigger).getByText('🇫🇷')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  expect(within(shippingTrigger).getByText('🇯🇵')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
};

const expectDisabledTriggerIgnoresClick = async (canvas: Canvas) => {
  const disabledTrigger = canvas.getByRole('button', {
    name: 'Disabled country',
  });

  expect(disabledTrigger).toHaveAttribute('aria-disabled', 'true');
  expect(disabledTrigger).not.toBeDisabled();
  expect(disabledTrigger).toHaveTextContent('France');

  await userEvent.click(disabledTrigger);
  await waitForSandboxRoundTrip();
  expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false');
  expect(
    canvas.getByRole('status', { name: 'Saved countries' }),
  ).toHaveTextContent('Billing: FR; Shipping: JP');
};

const selectCountry = async ({
  canvas,
  page,
  triggerName,
  optionName,
}: {
  canvas: Canvas;
  page: Canvas;
  triggerName: string;
  optionName: string;
}) => {
  const trigger = canvas.getByRole('button', { name: triggerName });
  const waitForInteraction = createWaitForFrontComponentInteraction(
    trigger.ownerDocument.body,
  );

  await userEvent.click(trigger);
  await waitForInteraction(() => {
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(page.getByRole('option', { name: optionName })).toBeVisible();
  });
  const popup = page.getByRole('dialog');
  await userEvent.click(page.getByRole('option', { name: optionName }));
  await waitForInteraction(() => {
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(popup).not.toBeInTheDocument();
  });
};

export const countrySelectTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  const canvas = within(context.canvasElement);
  const page = within(context.canvasElement.ownerDocument.body);
  const waitForInteraction = createWaitForFrontComponentInteraction(
    context.canvasElement.ownerDocument.body,
  );
  await expectFrontComponentMounted(canvas);

  expectTriggersShowSavedCountriesWithDecorativeFlags(canvas);
  await expectDisabledTriggerIgnoresClick(canvas);

  const billingTrigger = canvas.getByRole('button', {
    name: BILLING_COUNTRY_TRIGGER_NAME,
  });
  const shippingTrigger = canvas.getByRole('button', {
    name: 'Shipping country',
  });
  const savedCountries = canvas.getByRole('status', {
    name: 'Saved countries',
  });

  await userEvent.click(billingTrigger);
  await waitForInteraction(() => {
    expect(
      page.getByRole('dialog', { name: 'Billing countries' }),
    ).toBeVisible();
    expect(page.getByRole('option', { name: 'France' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const choices = page.getByRole('listbox', {
      name: 'Billing country choices',
    });
    expect(choices.tagName).toBe('SECTION');
    expect(choices).toHaveAttribute(
      'data-ref-target',
      'billing-country-choices',
    );
    expect(choices).toHaveAttribute(
      'data-render-target',
      'billing-country-choices',
    );
    const search = page.getByRole('searchbox', { name: 'Search' });
    expect(search.tagName).toBe('INPUT');
    expect(search).toBeVisible();
    expect(search).toHaveFocus();
    expect(search).toHaveAttribute('title', 'Search billing countries');
    expect(search).toHaveAttribute('data-ref-target', 'billing-country-search');
    expect(
      canvas.getByRole('status', { name: 'Country trigger click count' }),
    ).toHaveTextContent('1');
  });
  const unavailableCountry = page.getByRole('option', {
    name: 'Unavailable country',
  });
  expect(unavailableCountry).toBeDisabled();
  await userEvent.click(unavailableCountry);
  await waitForSandboxRoundTrip();
  expect(savedCountries).toHaveTextContent('Billing: FR; Shipping: JP');
  expect(billingTrigger).toHaveAttribute('aria-expanded', 'true');

  await userEvent.click(page.getByRole('option', { name: 'Brésil' }));
  await waitForInteraction(() => {
    expect(billingTrigger).toHaveTextContent('Brésil');
    expect(billingTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(savedCountries).toHaveTextContent('Billing: BR; Shipping: JP');
    expect(
      canvas.getByRole('status', { name: 'Country change details' })
        .textContent,
    ).toMatch(/^BR:item-press:click:.*Brésil/);
  });

  await selectCountry({
    canvas,
    page,
    triggerName: BILLING_COUNTRY_TRIGGER_NAME,
    optionName: 'No country',
  });
  await waitForInteraction(() => {
    expect(billingTrigger).toHaveTextContent('No country');
    expect(savedCountries).toHaveTextContent('Billing: null; Shipping: JP');
    expect(
      canvas.getByRole('status', { name: 'Country change details' }),
    ).toHaveTextContent('null:item-press:click:No country');
  });

  await selectCountry({
    canvas,
    page,
    triggerName: BILLING_COUNTRY_TRIGGER_NAME,
    optionName: 'Japon',
  });
  await selectCountry({
    canvas,
    page,
    triggerName: 'Shipping country',
    optionName: 'No country',
  });
  await waitForInteraction(() => {
    expect(shippingTrigger).toHaveTextContent('No country');
    expect(savedCountries).toHaveTextContent('Billing: JP; Shipping: null');
  });
  await selectCountry({
    canvas,
    page,
    triggerName: 'Shipping country',
    optionName: 'Brésil',
  });
  await waitForInteraction(() => {
    expect(shippingTrigger).toHaveTextContent('Brésil');
    expect(savedCountries).toHaveTextContent('Billing: JP; Shipping: BR');
  });

  await selectCountry({
    canvas,
    page,
    triggerName: 'Default country',
    optionName: 'No country',
  });
  await waitForInteraction(() =>
    expect(savedCountries).toHaveTextContent('Default: null'),
  );
  await selectCountry({
    canvas,
    page,
    triggerName: 'Default country',
    optionName: 'Japon',
  });
  await waitForInteraction(() =>
    expect(savedCountries).toHaveTextContent('Default: JP'),
  );

  const cancelableTrigger = canvas.getByRole('button', {
    name: 'Cancelable country',
  });
  await userEvent.click(cancelableTrigger);
  await waitForInteraction(() =>
    expect(page.getByRole('option', { name: 'Brésil' })).toBeVisible(),
  );
  await userEvent.click(page.getByRole('option', { name: 'Brésil' }));
  await waitForInteraction(() => {
    expect(cancelableTrigger).toHaveTextContent('France');
    expect(cancelableTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(savedCountries).toHaveTextContent('Cancelable: FR');
    expect(
      canvas.getByRole('status', { name: 'Canceled country change' }),
    ).toHaveTextContent('BR:item-press:true');
    expect(page.getByRole('option', { name: 'France' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(page.getByRole('option', { name: 'Japon' })).toBeVisible();
  });
  await userEvent.click(page.getByRole('option', { name: 'Japon' }));
  await waitForInteraction(() => {
    expect(cancelableTrigger).toHaveTextContent('Japon');
    expect(cancelableTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(savedCountries).toHaveTextContent('Cancelable: JP');
  });

  await userEvent.click(
    canvas.getByRole('button', { name: 'Set countries externally' }),
  );
  await waitForInteraction(() => {
    expect(billingTrigger).toHaveTextContent('Brésil');
    expect(shippingTrigger).toHaveTextContent('Brésil');
    expect(savedCountries).toHaveTextContent('Billing: BR; Shipping: BR');
  });
  await userEvent.click(
    canvas.getByRole('button', { name: 'Clear countries externally' }),
  );
  await waitForInteraction(() => {
    expect(billingTrigger).toHaveTextContent('No country');
    expect(shippingTrigger).toHaveTextContent('No country');
    expect(savedCountries).toHaveTextContent('Billing: null; Shipping: null');
  });

  await userEvent.click(billingTrigger);
  await waitForInteraction(() => {
    expect(page.getByRole('option', { name: 'No country' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const search = page.getByRole('searchbox', { name: 'Search' });
    expect(search).toBeVisible();
    expect(search).toHaveFocus();
  });
  await userEvent.type(page.getByRole('searchbox', { name: 'Search' }), 'jap');
  await waitForInteraction(() => {
    expect(page.getByRole('option', { name: 'Japon' })).toBeVisible();
    expect(page.queryByRole('option', { name: 'France' })).toBeNull();
    expect(page.queryByRole('option', { name: 'Brésil' })).toBeNull();
  });
  await userEvent.click(page.getByRole('option', { name: 'Japon' }));
  await waitForInteraction(() => {
    expect(billingTrigger).toHaveTextContent('Japon');
    expect(savedCountries).toHaveTextContent('Billing: JP; Shipping: null');
  });
  expect(errorHandler).not.toHaveBeenCalled();
};
