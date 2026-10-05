import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
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

const buildValidationRulesResult =
  (validationRules: ValidationRule[]) => () => ({
    data: {
      validationRules: validationRules.map((validationRule) => ({
        __typename: 'ValidationRule' as const,
        ...validationRule,
      })),
    },
  });

const buildValidationRulesMock = (
  result: ReturnType<typeof buildValidationRulesResult>,
) => ({
  request: {
    query: FindManyValidationRulesDocument,
    variables: { objectMetadataId: OBJECT_METADATA_ID },
  },
  result,
});

const renderUseValidationRules = ({
  results,
  isValidationRulesEnabled = true,
}: {
  results: ReturnType<typeof buildValidationRulesResult>[];
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
      <MockedProvider mocks={results.map(buildValidationRulesMock)}>
        {children}
      </MockedProvider>
    </JotaiProvider>
  );

  return renderHook(
    () => useValidationRules({ objectMetadataId: OBJECT_METADATA_ID }),
    { wrapper },
  );
};

const dispatchValidationRuleUpdate = (updatedRecord: ValidationRule) =>
  dispatchMetadataOperationBrowserEvent<ValidationRule>({
    metadataName: AllMetadataName.validationRule,
    operation: { type: 'update', updatedRecord, updatedFields: ['isActive'] },
  });

describe('useValidationRules', () => {
  it('should stop enforcing a rule another session disabled while the form is open', async () => {
    const refetchResult = jest.fn(
      buildValidationRulesResult([DISABLED_VALIDATION_RULE]),
    );

    const { result } = renderUseValidationRules({
      results: [
        buildValidationRulesResult([ACTIVE_VALIDATION_RULE]),
        refetchResult,
      ],
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
    expect(refetchResult).toHaveBeenCalledTimes(1);
  });

  it('should drop a rule another session deleted while the form is open', async () => {
    const { result } = renderUseValidationRules({
      results: [
        buildValidationRulesResult([ACTIVE_VALIDATION_RULE]),
        buildValidationRulesResult([]),
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
    const SECOND_VALIDATION_RULE: ValidationRule = {
      ...ACTIVE_VALIDATION_RULE,
      id: '20202020-0000-4000-8000-000000000011',
      name: 'Amount is set',
      expression: 'amount != null',
    };

    const refetchResult = jest.fn(
      buildValidationRulesResult([
        DISABLED_VALIDATION_RULE,
        { ...SECOND_VALIDATION_RULE, isActive: false },
      ]),
    );

    const { result } = renderUseValidationRules({
      results: [
        buildValidationRulesResult([
          ACTIVE_VALIDATION_RULE,
          SECOND_VALIDATION_RULE,
        ]),
        refetchResult,
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
      expect(
        result.current.validationRules.every(
          (validationRule) => !validationRule.isActive,
        ),
      ).toBe(true),
    );
    expect(refetchResult).toHaveBeenCalledTimes(1);
  });

  it('should not refetch for its own echoed save or for rules of another object', async () => {
    const refetchResult = jest.fn(buildValidationRulesResult([]));

    const { result } = renderUseValidationRules({
      results: [
        buildValidationRulesResult([ACTIVE_VALIDATION_RULE]),
        refetchResult,
      ],
    });

    await waitFor(() => expect(result.current.validationRules).toHaveLength(1));

    act(() => {
      dispatchValidationRuleUpdate(ACTIVE_VALIDATION_RULE);
      dispatchValidationRuleUpdate({
        ...ACTIVE_VALIDATION_RULE,
        id: '20202020-0000-4000-8000-000000000012',
        objectMetadataId: OTHER_OBJECT_METADATA_ID,
        isActive: false,
      });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(refetchResult).not.toHaveBeenCalled();
    expect(result.current.validationRules).toHaveLength(1);
  });

  it('should resync rules missed while the event stream was disconnected', async () => {
    const { result } = renderUseValidationRules({
      results: [
        buildValidationRulesResult([ACTIVE_VALIDATION_RULE]),
        buildValidationRulesResult([DISABLED_VALIDATION_RULE]),
      ],
    });

    await waitFor(() =>
      expect(result.current.validationRules).toMatchObject([
        { isActive: true },
      ]),
    );

    act(() => {
      dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME);
    });

    await waitFor(() =>
      expect(result.current.validationRules).toMatchObject([
        { isActive: false },
      ]),
    );
  });

  it('should neither load nor listen when the feature flag is disabled', async () => {
    const validationRulesResult = jest.fn(
      buildValidationRulesResult([ACTIVE_VALIDATION_RULE]),
    );

    const { result } = renderUseValidationRules({
      results: [validationRulesResult],
      isValidationRulesEnabled: false,
    });

    act(() => {
      dispatchValidationRuleUpdate(DISABLED_VALIDATION_RULE);
      dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME);
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(validationRulesResult).not.toHaveBeenCalled();
    expect(result.current.validationRules).toEqual([]);
  });
});
