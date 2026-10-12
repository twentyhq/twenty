import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';

import { CurrencyPickerDropdownButtonExample } from './CurrencyPickerDropdownButtonExample';

const onCurrencyChange = fn<(currencyCode: string) => void>();

const meta: Meta<typeof CurrencyPickerDropdownButton> = {
  title: 'UI/Input/CurrencyPickerDropdownButton',
  component: CurrencyPickerDropdownButton,
  decorators: [ComponentDecorator],
  args: {
    selectedCurrencyCode: 'USD',
    onChange: onCurrencyChange,
  },
  render: ({ selectedCurrencyCode, onChange }) => (
    <CurrencyPickerDropdownButtonExample
      key={selectedCurrencyCode}
      selectedCurrencyCode={selectedCurrencyCode}
      onChange={onChange}
    />
  ),
};

export default meta;
type Story = StoryObj<typeof CurrencyPickerDropdownButton>;

export const SearchPreservesCurrencyCallback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Currency: USD' });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Currency' });
    await waitFor(() => expect(dialog).toBeVisible());
    const search = await body.findByRole('searchbox', { name: 'Search' });
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'zzzzzz');
    expect(await body.findByText('No results')).toBeVisible();
    await userEvent.clear(search);
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
    expect(onCurrencyChange).toHaveBeenCalledWith('EUR');
    expect(trigger).toHaveTextContent('EUR');
    expect(trigger).toHaveAccessibleName('Currency: EUR');
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
    const firstTrigger = canvas.getByRole('button', { name: 'Currency: USD' });
    const secondTrigger = canvas.getByRole('button', {
      name: 'Currency: EUR',
    });

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
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Currency: USD',
    });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Currency' });
    await waitFor(() => expect(dialog).toBeVisible());
    expect(
      body.queryByRole('button', { pressed: true }),
    ).not.toBeInTheDocument();
    const search = await body.findByRole('searchbox', { name: 'Search' });

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(dialog).toBeVisible());
    expect(onCurrencyChange).not.toHaveBeenCalled();

    await userEvent.type(search, 'usd');
    await userEvent.click(
      await body.findByRole('button', { name: /\(USD\)$/ }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onCurrencyChange).toHaveBeenCalledTimes(1);
    expect(onCurrencyChange).toHaveBeenCalledWith('USD');
    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: /\(USD\)$/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
