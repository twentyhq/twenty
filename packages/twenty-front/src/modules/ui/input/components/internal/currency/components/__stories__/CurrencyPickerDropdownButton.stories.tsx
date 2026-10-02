import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';
import { type Currency } from '@/ui/input/components/internal/types/Currency';

import { CurrencyPickerDropdownButtonExample } from './CurrencyPickerDropdownButtonExample';

const onCurrencyChange = fn<(currency: Currency) => void>();

const meta: Meta<typeof CurrencyPickerDropdownButton> = {
  title: 'UI/Input/CurrencyPickerDropdownButton',
  component: CurrencyPickerDropdownButton,
  decorators: [ComponentDecorator],
  args: {
    selectedCurrencyCode: 'USD',
    onChange: onCurrencyChange,
  },
  render: CurrencyPickerDropdownButtonExample,
};

export default meta;
type Story = StoryObj<typeof CurrencyPickerDropdownButton>;

export const SearchPreservesCurrencyCallback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'USD' });
    const euroCurrency = CURRENCIES.find(({ value }) => value === 'EUR');

    expect(euroCurrency).toBeDefined();
    await userEvent.click(trigger);
    expect(await body.findByRole('dialog', { name: 'Currency' })).toBeVisible();
    const search = await body.findByRole('searchbox', { name: 'Search' });
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'euro');
    const euro = await body.findByRole('button', { name: 'Euro (EUR)' });
    expect(
      body.queryByRole('button', { pressed: true }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(euro).toHaveAttribute('data-highlighted'));
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onCurrencyChange).toHaveBeenCalledTimes(1);
    expect(onCurrencyChange.mock.calls[0]?.[0]).toBe(euroCurrency);
    expect(trigger).toHaveTextContent('EUR');
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.click(trigger);
    expect(await body.findByRole('searchbox', { name: 'Search' })).toHaveValue(
      '',
    );
    expect(
      await body.findByRole('button', { name: 'Euro (EUR)' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const IndependentInstances: Story = {
  render: ({ onChange }) => (
    <>
      <CurrencyPickerDropdownButtonExample
        selectedCurrencyCode="USD"
        onChange={onChange}
      />
      <CurrencyPickerDropdownButtonExample
        selectedCurrencyCode="EUR"
        onChange={onChange}
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const firstTrigger = canvas.getByRole('button', { name: 'USD' });
    const secondTrigger = canvas.getByRole('button', { name: 'EUR' });

    await userEvent.click(firstTrigger);
    expect(
      await body.findAllByRole('dialog', { name: 'Currency' }),
    ).toHaveLength(1);
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.type(
      await body.findByRole('searchbox', { name: 'Search' }),
      'jpy',
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(firstTrigger).toHaveTextContent('JPY');
    expect(secondTrigger).toHaveTextContent('EUR');
    await waitFor(() => expect(firstTrigger).toHaveFocus());

    await userEvent.click(secondTrigger);
    expect(
      await body.findAllByRole('dialog', { name: 'Currency' }),
    ).toHaveLength(1);
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(await body.findByRole('searchbox', { name: 'Search' })).toHaveValue(
      '',
    );
    expect(
      await body.findByRole('button', { name: 'Euro (EUR)' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.type(
      body.getByRole('searchbox', { name: 'Search' }),
      'gbp',
    );
    await userEvent.click(
      await body.findByRole('button', { name: /\(GBP\)$/ }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(firstTrigger).toHaveTextContent('JPY');
    expect(secondTrigger).toHaveTextContent('GBP');
    await waitFor(() => expect(secondTrigger).toHaveFocus());
  },
};

export const UnknownCurrencyUsesDisplayFallback: Story = {
  args: { selectedCurrencyCode: 'UNKNOWN' },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', { name: 'USD' });

    await userEvent.click(trigger);
    expect(await body.findByRole('dialog', { name: 'Currency' })).toBeVisible();
    expect(
      body.queryByRole('button', { pressed: true }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(body.getByRole('dialog', { name: 'Currency' })).toBeVisible();
    expect(onCurrencyChange).not.toHaveBeenCalled();

    await userEvent.type(
      body.getByRole('searchbox', { name: 'Search' }),
      'usd',
    );
    await userEvent.click(
      await body.findByRole('button', { name: /\(USD\)$/ }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: /\(USD\)$/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
