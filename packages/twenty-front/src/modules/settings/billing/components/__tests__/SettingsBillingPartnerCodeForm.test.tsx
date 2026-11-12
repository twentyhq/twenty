import { type MockedResponse } from '@apollo/client/testing';
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

const renderForm = ({ mocks }: { mocks: MockedResponse[] }) =>
  render(
    <JotaiProvider store={createStore()}>
      <MockedProvider mocks={mocks}>
        <I18nProvider i18n={i18n}>
          <SettingsBillingPartnerCodeForm />
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

    renderForm({
      mocks: [
        buildPartnerCodeMock({ partnerCode: null, isEditable: true }),
        {
          request: {
            query: SetBillingPartnerCodeDocument,
            variables: { partnerCode: 'ACME' },
          },
          result: setPartnerCodeResult,
        },
        buildPartnerCodeMock({ partnerCode: 'acme', isEditable: false }),
      ],
    });

    const input = await screen.findByLabelText('Partner code');

    await userEvent.type(input, 'ACME');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(setPartnerCodeResult).toHaveBeenCalled());
  });

  it('should show why a code was refused under the field', async () => {
    renderForm({
      mocks: [
        buildPartnerCodeMock({ partnerCode: null, isEditable: true }),
        {
          request: {
            query: SetBillingPartnerCodeDocument,
            variables: { partnerCode: 'NORTH WIND!' },
          },
          result: {
            errors: [
              {
                message: 'Partner code NORTH WIND! is not valid',
                extensions: {
                  userFriendlyMessage: 'This partner code is not valid.',
                },
              },
            ],
          },
        },
      ],
    });

    await userEvent.type(
      await screen.findByLabelText('Partner code'),
      'NORTH WIND!',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(
      await screen.findByText('This partner code is not valid.'),
    ).toBeInTheDocument();
  });

  it('should lock a code that is already set', async () => {
    renderForm({
      mocks: [
        buildPartnerCodeMock({ partnerCode: 'northwind', isEditable: false }),
      ],
    });

    expect(await screen.findByDisplayValue('NORTHWIND')).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Apply' }),
    ).not.toBeInTheDocument();
  });

  it('should explain that codes are trial only once the trial is over', async () => {
    renderForm({
      mocks: [buildPartnerCodeMock({ partnerCode: null, isEditable: false })],
    });

    expect(
      await screen.findByText(
        'Partner codes can only be added during the free trial.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Partner code')).not.toBeInTheDocument();
  });
});
