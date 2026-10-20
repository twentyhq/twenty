import { RecordFormCurrencyFieldInput } from '@/object-record/record-form/components/RecordFormCurrencyFieldInput';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyCode } from 'twenty-shared/constants';

describe('RecordFormCurrencyFieldInput', () => {
  it('calls onError with an error message when typing an invalid number', async () => {
    const user = userEvent.setup();
    const onError = jest.fn();
    const onChange = jest.fn();

    render(
      <I18nProvider i18n={i18n}>
        <RecordFormCurrencyFieldInput
          label="Amount"
          defaultCurrencyCode={CurrencyCode.USD}
          onChange={onChange}
          onError={onError}
        />
      </I18nProvider>,
    );

    const input = screen.getByPlaceholderText('Enter a number');

    await user.type(input, '12');

    expect(onChange).toHaveBeenCalledWith({
      currencyCode: CurrencyCode.USD,
      amountMicros: 12000000,
    });
    expect(onError).toHaveBeenCalledWith(undefined);

    await user.type(input, 'x');

    expect(onError).toHaveBeenCalledWith('Invalid number');
    expect(screen.getByText('Invalid number')).toBeInTheDocument();
  });

  it('clears error when correcting an invalid number to a valid number', async () => {
    const user = userEvent.setup();
    const onError = jest.fn();
    const onChange = jest.fn();

    render(
      <I18nProvider i18n={i18n}>
        <RecordFormCurrencyFieldInput
          label="Amount"
          defaultCurrencyCode={CurrencyCode.USD}
          onChange={onChange}
          onError={onError}
        />
      </I18nProvider>,
    );

    const input = screen.getByPlaceholderText('Enter a number');

    await user.type(input, '12x');
    expect(onError).toHaveBeenCalledWith('Invalid number');

    await user.keyboard('{Backspace}');

    expect(onError).toHaveBeenLastCalledWith(undefined);
    expect(screen.queryByText('Invalid number')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({
      currencyCode: CurrencyCode.USD,
      amountMicros: 12000000,
    });
  });
});
