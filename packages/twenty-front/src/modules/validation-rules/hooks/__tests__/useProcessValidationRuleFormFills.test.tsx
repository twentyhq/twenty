import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { useProcessValidationRuleFormFills } from '@/validation-rules/hooks/useProcessValidationRuleFormFills';
import { validationRuleFormFillState } from '@/validation-rules/states/validationRuleFormFillState';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const OPPORTUNITY_OBJECT_METADATA_ID =
  getMockObjectMetadataItemOrThrow('opportunity').id;

const buildFillMessage = (
  validationRuleId?: string,
  objectMetadataId = OPPORTUNITY_OBJECT_METADATA_ID,
) => {
  const fill = {
    objectMetadataId,
    validationRuleId,
    name: 'Customers need an amount',
    expression: "stage != 'CUSTOMER' or not isEmpty(amount)",
    message: 'Customer opportunities must have an amount.',
  };

  return {
    parts: [
      {
        type: 'tool-fill_validation_rule_form',
        toolCallId: `call-${objectMetadataId}-${validationRuleId ?? 'new'}`,
        state: 'output-available',
        input: fill,
        output: { success: true, message: 'Filled', result: fill },
      } as unknown as ExtendedUIMessagePart,
    ],
  };
};

const renderProcessHook = (pathname: string) => {
  window.history.pushState({}, '', pathname);

  const store = createStore();

  setTestObjectMetadataItemsInMetadataStore(
    store,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  const { result } = renderHook(() => useProcessValidationRuleFormFills(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

  return {
    store,
    processValidationRuleFormFills:
      result.current.processValidationRuleFormFills,
  };
};

describe('useProcessValidationRuleFormFills', () => {
  it('hands a fill to the open rule form once', () => {
    const { store, processValidationRuleFormFills } = renderProcessHook(
      '/settings/objects/opportunities/validation-rules/rule-1',
    );

    processValidationRuleFormFills(buildFillMessage('rule-1'));

    expect(store.get(validationRuleFormFillState.atom)).toMatchObject({
      toolCallId: `call-${OPPORTUNITY_OBJECT_METADATA_ID}-rule-1`,
      validationRuleId: 'rule-1',
      expression: "stage != 'CUSTOMER' or not isEmpty(amount)",
    });

    store.set(validationRuleFormFillState.atom, null);
    processValidationRuleFormFills(buildFillMessage('rule-1'));

    expect(store.get(validationRuleFormFillState.atom)).toBeNull();
  });

  it('drops a fill meant for another form', () => {
    const { store, processValidationRuleFormFills } = renderProcessHook(
      '/settings/objects/opportunities/new-validation-rule',
    );

    processValidationRuleFormFills(buildFillMessage('rule-1'));
    processValidationRuleFormFills(
      buildFillMessage(
        undefined,
        getMockObjectMetadataItemOrThrow('company').id,
      ),
    );

    expect(store.get(validationRuleFormFillState.atom)).toBeNull();

    processValidationRuleFormFills(buildFillMessage());

    expect(store.get(validationRuleFormFillState.atom)).toMatchObject({
      toolCallId: `call-${OPPORTUNITY_OBJECT_METADATA_ID}-new`,
      validationRuleId: null,
    });
  });
});
