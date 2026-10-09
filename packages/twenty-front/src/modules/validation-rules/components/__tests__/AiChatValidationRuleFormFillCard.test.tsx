import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AiChatValidationRuleFormFillCard } from '@/validation-rules/components/AiChatValidationRuleFormFillCard';
import { validationRuleFormFillState } from '@/validation-rules/states/validationRuleFormFillState';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const VALIDATION_RULE_FORM_FILL = {
  objectMetadataId: getMockObjectMetadataItemOrThrow('opportunity').id,
  validationRuleId: 'rule-1',
  name: 'Customers need an amount',
  expression: "stage != 'CUSTOMER' or not isEmpty(amount)",
  message: 'Customer opportunities must have an amount.',
  errorFieldMetadataId: null,
};

const renderCard = (pathname: string) => {
  const store = createStore();

  setTestObjectMetadataItemsInMetadataStore(
    store,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  render(
    <AiChatValidationRuleFormFillCard
      validationRuleFormFill={VALIDATION_RULE_FORM_FILL}
    />,
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={store}>
          <I18nProvider i18n={i18n}>
            <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
          </I18nProvider>
        </JotaiProvider>
      ),
    },
  );

  return { store };
};

describe('AiChatValidationRuleFormFillCard', () => {
  it('applies the values to the open rule form on click', async () => {
    const { store } = renderCard(
      '/settings/objects/opportunities/validation-rules/rule-1',
    );

    expect(store.get(validationRuleFormFillState.atom)).toBeNull();

    await userEvent.click(
      screen.getByRole('button', { name: 'Apply to form' }),
    );

    expect(store.get(validationRuleFormFillState.atom)).toEqual(
      VALIDATION_RULE_FORM_FILL,
    );
  });

  it.each([
    '/settings/objects/opportunities/validation-rules/rule-2',
    '/settings/objects/companies/new-validation-rule',
    '/objects/opportunities',
  ])('offers no button on %s', (pathname) => {
    renderCard(pathname);

    expect(screen.getByText('Open the rule page to apply it.')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Apply to form' }),
    ).not.toBeInTheDocument();
  });
});
