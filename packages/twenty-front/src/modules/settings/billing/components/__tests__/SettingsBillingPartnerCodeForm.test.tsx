import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { SettingsBillingPartnerCodeForm } from '@/settings/billing/components/SettingsBillingPartnerCodeForm';
import {
  BillingPartnerCodeDocument,
  SetBillingPartnerCodeDocument,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const buildPartnerCodeMock = ({
  partnerCode,
  isEditable,
}: {
  partnerCode: string | null;
  isEditable: boolean;
}) => ({
  request: { query: BillingPartnerCodeDocument },
  result: {
    data: {
      billingPartnerCode: {
        __typename: 'BillingPartnerCode',
        partnerCode,
        isEditable,
      },
    },
  },
});

const renderForm = (mocks: ReadonlyArray<unknown>) =>
  render(
    <JotaiProvider store={createStore()}>
      <MockedProvider mocks={mocks as never}>
        <I18nProvider i18n={i18n}>
          <SettingsBillingPartnerCodeForm instanceId="partner-code-test" />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );

describe('SettingsBillingPartnerCodeForm', () => {
  it('should let the customer add a code when the workspace has none', async () => {
    const setPartnerCodeResult = jest.fn(() => ({
      data: {
        setBillingPartnerCode: {
          __typename: 'BillingPartnerCode',
          partnerCode: 'acme',
          isEditable: false,
        },
      },
    }));

    renderForm([
      buildPartnerCodeMock({ partnerCode: null, isEditable: true }),
      {
        request: {
          query: SetBillingPartnerCodeDocument,
          variables: { partnerCode: 'ACME' },
        },
        result: setPartnerCodeResult,
      },
      buildPartnerCodeMock({ partnerCode: 'acme', isEditable: false }),
    ]);

    const input = await screen.findByLabelText('Partner code');

    await userEvent.type(input, 'ACME');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(setPartnerCodeResult).toHaveBeenCalled());
  });

  it('should show why a code was refused under the field', async () => {
    renderForm([
      buildPartnerCodeMock({ partnerCode: null, isEditable: true }),
      {
        request: {
          query: SetBillingPartnerCodeDocument,
          variables: { partnerCode: 'NORTHWNID' },
        },
        result: {
          errors: [
            {
              message: 'Partner code NORTHWNID is not valid',
              extensions: {
                userFriendlyMessage: 'This partner code does not exist.',
              },
            },
          ],
        },
      },
    ]);

    await userEvent.type(
      await screen.findByLabelText('Partner code'),
      'NORTHWNID',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(
      await screen.findByText('This partner code does not exist.'),
    ).toBeInTheDocument();
  });

  it('should lock a code that is already set', async () => {
    renderForm([
      buildPartnerCodeMock({ partnerCode: 'northwind', isEditable: false }),
    ]);

    expect(await screen.findByDisplayValue('NORTHWIND')).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Apply' }),
    ).not.toBeInTheDocument();
  });
});
