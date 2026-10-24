import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { RecordFormCurrencyFieldInput } from '@/object-record/record-form/components/RecordFormCurrencyFieldInput';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { CurrencyCode } from 'twenty-shared/constants';

const INSTANCE_ID = 'amount-field-input';

const renderCurrencyFieldInput = () => {
  const store = createStore();
  const onChange = jest.fn();

  render(
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <RecordFieldComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <RecordFormCurrencyFieldInput
            label="Amount"
            defaultCurrencyCode={CurrencyCode.USD}
            onChange={onChange}
          />
        </RecordFieldComponentInstanceContext.Provider>
      </I18nProvider>
    </JotaiProvider>,
  );

  const isFieldInError = () =>
    store.get(
      recordFieldInputIsFieldInErrorComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      }),
    );

  return { onChange, isFieldInError };
};

describe('RecordFormCurrencyFieldInput', () => {
  it('flags the field in error while the amount is not a number', async () => {
    const user = userEvent.setup();
    const { onChange, isFieldInError } = renderCurrencyFieldInput();
    const input = screen.getByPlaceholderText('Enter a number');

    await user.type(input, '12');

    expect(isFieldInError()).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith({
      currencyCode: CurrencyCode.USD,
      amountMicros: 12000000,
    });

    await user.type(input, 'x');

    expect(isFieldInError()).toBe(true);
    expect(screen.getByText('Invalid number')).toBeInTheDocument();

    await user.keyboard('{Backspace}');

    expect(isFieldInError()).toBe(false);
    expect(screen.queryByText('Invalid number')).not.toBeInTheDocument();
  });
});
