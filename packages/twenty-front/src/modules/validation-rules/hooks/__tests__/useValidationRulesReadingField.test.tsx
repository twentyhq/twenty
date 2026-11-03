import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { useValidationRulesReadingField } from '@/validation-rules/hooks/useValidationRulesReadingField';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { FindValidationRulesReadingFieldDocument } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const FIELD_METADATA_ID = '20202020-0000-4000-8000-000000000001';

const VALIDATION_RULE: ValidationRule = {
  id: '20202020-0000-4000-8000-000000000010',
  objectMetadataId: '20202020-0000-4000-8000-000000000002',
  name: 'Company has employees',
  description: null,
  icon: null,
  errorFieldMetadataId: null,
  expression: 'company.employees > 0',
  message: 'Add employees',
  isActive: true,
};

const renderUseValidationRulesReadingField = () => {
  resetJotaiStore();
  jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);

  const mocks = [
    {
      request: {
        query: FindValidationRulesReadingFieldDocument,
        variables: { fieldMetadataId: FIELD_METADATA_ID },
      },
      delay: 0,
      result: {
        data: {
          validationRulesReadingField: [
            { __typename: 'ValidationRule' as const, ...VALIDATION_RULE },
          ],
        },
      },
    },
  ];

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    </JotaiProvider>
  );

  return renderHook(
    () =>
      useValidationRulesReadingField({ fieldMetadataId: FIELD_METADATA_ID }),
    { wrapper },
  );
};

describe('useValidationRulesReadingField', () => {
  it('should be loading, then return the rules reading the field', async () => {
    const { result } = renderUseValidationRulesReadingField();

    expect(result.current.loading).toBe(true);

    await waitFor(() =>
      expect(result.current.validationRulesReadingField).toMatchObject([
        { name: VALIDATION_RULE.name },
      ]),
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.hasFailedToLoad).toBe(false);
  });
});
