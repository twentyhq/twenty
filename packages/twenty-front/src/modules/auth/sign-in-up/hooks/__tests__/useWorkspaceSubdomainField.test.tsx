import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { useWorkspaceSubdomainField } from '@/auth/sign-in-up/hooks/useWorkspaceSubdomainField';
import {
  CheckWorkspaceSubdomainAvailabilityDocument,
  GetWorkspaceCreationDefaultsDocument,
} from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

dynamicActivate(SOURCE_LOCALE);

const availabilityMock = (
  subdomain: string,
  result: {
    isValid: boolean;
    available: boolean;
    suggestedSubdomain: string;
    suggestedSubdomains: string[];
  },
) => ({
  request: {
    query: CheckWorkspaceSubdomainAvailabilityDocument,
    variables: { subdomain },
  },
  result: {
    data: {
      checkWorkspaceSubdomainAvailability: {
        __typename: 'SubdomainAvailabilityDTO',
        ...result,
      },
    },
  },
});

const cacheWithDefaults = (displayName: string, subdomain: string) => {
  const cache = new InMemoryCache();

  cache.writeQuery({
    query: GetWorkspaceCreationDefaultsDocument,
    data: {
      getWorkspaceCreationDefaults: {
        __typename: 'WorkspaceCreationDefaultsDTO',
        displayName,
        subdomain,
      },
    },
  });

  return cache;
};

const createWrapper =
  (mocks: ReturnType<typeof availabilityMock>[], cache?: InMemoryCache) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} cache={cache}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </MockedProvider>
  );

describe('useWorkspaceSubdomainField', () => {
  it('seeds the name and address from the preloaded backend defaults', () => {
    const { result } = renderHook(() => useWorkspaceSubdomainField(), {
      wrapper: createWrapper([], cacheWithDefaults('Acme', 'acme')),
    });

    expect(result.current.workspaceName).toBe('Acme');
    expect(result.current.subdomain).toBe('acme');
    expect(result.current.status).toBe('available');
    expect(result.current.isAvailable).toBe(true);
  });

  it('auto-fills an available address as the workspace name is typed', async () => {
    const { result } = renderHook(() => useWorkspaceSubdomainField(), {
      wrapper: createWrapper([
        availabilityMock('apple', {
          isValid: true,
          available: true,
          suggestedSubdomain: 'apple',
          suggestedSubdomains: ['apple'],
        }),
      ]),
    });

    act(() => {
      result.current.handleWorkspaceNameChange('Apple');
    });

    expect(result.current.workspaceName).toBe('Apple');

    await waitFor(() => expect(result.current.subdomain).toBe('apple'), {
      timeout: 3000,
    });
    expect(result.current.status).toBe('available');
    expect(result.current.isAvailable).toBe(true);
  });

  it('skips availability checks when the subdomain field is disabled', () => {
    const { result } = renderHook(
      () => useWorkspaceSubdomainField({ isSubdomainEnabled: false }),
      { wrapper: createWrapper([]) },
    );

    act(() => {
      result.current.handleWorkspaceNameChange('Apple');
    });

    // The name is still tracked, but no subdomain is derived and no lookup runs.
    expect(result.current.workspaceName).toBe('Apple');
    expect(result.current.subdomain).toBe('');
    expect(result.current.status).toBe('idle');
  });

  it('reports an unavailable manual address and offers available alternatives', async () => {
    const { result } = renderHook(() => useWorkspaceSubdomainField(), {
      wrapper: createWrapper([
        availabilityMock('taken', {
          isValid: true,
          available: false,
          suggestedSubdomain: 'taken-2',
          suggestedSubdomains: ['taken-2', 'taken-3', 'taken-4'],
        }),
      ]),
    });

    act(() => {
      result.current.handleSubdomainChange('taken');
    });

    await waitFor(() => expect(result.current.status).toBe('unavailable'), {
      timeout: 3000,
    });
    expect(result.current.suggestions).toEqual([
      'taken-2',
      'taken-3',
      'taken-4',
    ]);
    expect(result.current.isAvailable).toBe(false);
  });

  it('re-validates an applied alternative before enabling submission', async () => {
    const { result } = renderHook(() => useWorkspaceSubdomainField(), {
      wrapper: createWrapper([
        availabilityMock('taken', {
          isValid: true,
          available: false,
          suggestedSubdomain: 'taken-2',
          suggestedSubdomains: ['taken-2', 'taken-3', 'taken-4'],
        }),
        availabilityMock('taken-3', {
          isValid: true,
          available: true,
          suggestedSubdomain: 'taken-3',
          suggestedSubdomains: ['taken-3'],
        }),
      ]),
    });

    act(() => {
      result.current.handleSubdomainChange('taken');
    });

    await waitFor(
      () => expect(result.current.suggestions).toContain('taken-3'),
      { timeout: 3000 },
    );

    act(() => {
      result.current.applySuggestionValue('taken-3');
    });

    // Continue stays disabled until the alternative is re-confirmed available.
    expect(result.current.isAvailable).toBe(false);

    await waitFor(() => expect(result.current.status).toBe('available'), {
      timeout: 3000,
    });
    expect(result.current.subdomain).toBe('taken-3');
    expect(result.current.suggestions).toEqual([]);
  });
});
