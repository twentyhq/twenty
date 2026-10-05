import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import {
  AllMetadataName,
  FeatureFlagKey,
  FindManyValidationRulesDocument,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000002';

const ACTIVE_VALIDATION_RULE: ValidationRule = {
  id: '20202020-0000-4000-8000-000000000010',
  objectMetadataId: OBJECT_METADATA_ID,
  name: 'No won deals yet',
  description: null,
  icon: 'IconListCheck',
  errorFieldMetadataId: null,
  expression: 'stage != "WON"',
  message: 'Deals cannot be won yet',
  isActive: true,
};

const DISABLED_VALIDATION_RULE: ValidationRule = {
  ...ACTIVE_VALIDATION_RULE,
  isActive: false,
};

const SECOND_VALIDATION_RULE: ValidationRule = {
  ...ACTIVE_VALIDATION_RULE,
  id: '20202020-0000-4000-8000-000000000011',
  name: 'Amount is set',
  expression: 'amount != null',
};

const buildValidationRulesMock = (validationRules: ValidationRule[]) => ({
  request: {
    query: FindManyValidationRulesDocument,
    variables: { objectMetadataId: OBJECT_METADATA_ID },
  },
  delay: jest.fn(() => 0),
  result: jest.fn(() => ({
    data: {
      validationRules: validationRules.map((validationRule) => ({
        __typename: 'ValidationRule' as const,
        ...validationRule,
      })),
    },
  })),
});

const renderUseValidationRules = ({
  mocks,
  isValidationRulesEnabled = true,
}: {
  mocks: ReturnType<typeof buildValidationRulesMock>[];
  isValidationRulesEnabled?: boolean;
}) => {
  resetJotaiStore();
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_VALIDATION_RULES_ENABLED,
        value: isValidationRulesEnabled,
      },
    ],
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    </JotaiProvider>
  );

  const loadingStates: boolean[] = [];

  const renderedHook = renderHook(
    () => {
      const validationRules = useValidationRules({
        objectMetadataId: OBJECT_METADATA_ID,
      });

      loadingStates.push(validationRules.loading);

      return validationRules;
    },
    { wrapper },
  );

  return { ...renderedHook, loadingStates };
};

const dispatchValidationRuleUpdate = (updatedRecord: ValidationRule) =>
  dispatchMetadataOperationBrowserEvent<ValidationRule>({
    metadataName: AllMetadataName.validationRule,
    operation: { type: 'update', updatedRecord, updatedFields: ['isActive'] },
  });

const flushPendingRequests = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

describe('useValidationRules', () => {
  it('should stop enforcing a rule another session disabled while the form is open', async () => {
    const refetchMock = buildValidationRulesMock([DISABLED_VALIDATION_RULE]);

    const { result } = renderUseValidationRules({
      mocks: [buildValidationRulesMock([ACTIVE_VALIDATION_RULE]), refetchMock],
    });

    await waitFor(() =>
      expect(result.current.validationRules).toMatchObject([
        { id: ACTIVE_VALIDATION_RULE.id, isActive: true },
      ]),
    );

    act(() => {
      dispatchValidationRuleUpdate(DISABLED_VALIDATION_RULE);
    });

    await waitFor(() =>
      expect(result.current.validationRules).toMatchObject([
        { id: ACTIVE_VALIDATION_RULE.id, isActive: false },
      ]),
    );
    expect(refetchMock.result).toHaveBeenCalledTimes(1);
  });

  it('should refresh rules in the background without reporting loading', async () => {
    const { result, loadingStates } = renderUseValidationRules({
      mocks: [
        buildValidationRulesMock([ACTIVE_VALIDATION_RULE]),
        buildValidationRulesMock([DISABLED_VALIDATION_RULE]),
      ],
    });

    await waitFor(() => expect(result.current.validationRules).toHaveLength(1));

    const loadingStatesCountBeforeRefresh = loadingStates.length;

    act(() => {
      dispatchValidationRuleUpdate(DISABLED_VALIDATION_RULE);
    });

    await waitFor(() =>
      expect(result.current.validationRules).toMatchObject([
        { isActive: false },
      ]),
    );
    expect(loadingStates.slice(loadingStatesCountBeforeRefresh)).not.toContain(
      true,
    );
  });

  it('should drop a rule another session deleted while the form is open', async () => {
    const { result } = renderUseValidationRules({
      mocks: [
        buildValidationRulesMock([ACTIVE_VALIDATION_RULE]),
        buildValidationRulesMock([]),
      ],
    });

    await waitFor(() => expect(result.current.validationRules).toHaveLength(1));

    act(() => {
      dispatchMetadataOperationBrowserEvent<ValidationRule>({
        metadataName: AllMetadataName.validationRule,
        operation: {
          type: 'delete',
          deletedRecordId: ACTIVE_VALIDATION_RULE.id,
        },
      });
    });

    await waitFor(() => expect(result.current.validationRules).toHaveLength(0));
  });

  it('should refetch once when a field migration updates several rules at once', async () => {
    const refetchMock = buildValidationRulesMock([
      DISABLED_VALIDATION_RULE,
      { ...SECOND_VALIDATION_RULE, isActive: false },
    ]);

    const { result } = renderUseValidationRules({
      mocks: [
        buildValidationRulesMock([
          ACTIVE_VALIDATION_RULE,
          SECOND_VALIDATION_RULE,
        ]),
        refetchMock,
      ],
    });

    await waitFor(() => expect(result.current.validationRules).toHaveLength(2));

    act(() => {
      dispatchValidationRuleUpdate(DISABLED_VALIDATION_RULE);
      dispatchValidationRuleUpdate({
        ...SECOND_VALIDATION_RULE,
        isActive: false,
      });
    });

    await waitFor(() =>
      expect(result.current.validationRules).toMatchObject([
        { id: ACTIVE_VALIDATION_RULE.id, isActive: false },
        { id: SECOND_VALIDATION_RULE.id, isActive: false },
      ]),
    );
    expect(refetchMock.result).toHaveBeenCalledTimes(1);
  });

  it('should not refetch when a rule of another object changes', async () => {
    const refetchMock = buildValidationRulesMock([]);

    const { result } = renderUseValidationRules({
      mocks: [buildValidationRulesMock([ACTIVE_VALIDATION_RULE]), refetchMock],
    });

    await waitFor(() => expect(result.current.validationRules).toHaveLength(1));

    act(() => {
      dispatchValidationRuleUpdate({
        ...ACTIVE_VALIDATION_RULE,
        id: '20202020-0000-4000-8000-000000000012',
        objectMetadataId: OTHER_OBJECT_METADATA_ID,
        isActive: false,
      });
    });

    await flushPendingRequests();

    expect(refetchMock.delay).not.toHaveBeenCalled();
    expect(result.current.validationRules).toHaveLength(1);
  });

  it('should neither load nor listen when the feature flag is disabled', async () => {
    const validationRulesMock = buildValidationRulesMock([
      ACTIVE_VALIDATION_RULE,
    ]);

    const { result } = renderUseValidationRules({
      mocks: [validationRulesMock],
      isValidationRulesEnabled: false,
    });

    act(() => {
      dispatchValidationRuleUpdate(DISABLED_VALIDATION_RULE);
    });

    await flushPendingRequests();

    expect(validationRulesMock.delay).not.toHaveBeenCalled();
    expect(result.current.validationRules).toEqual([]);
  });
});
