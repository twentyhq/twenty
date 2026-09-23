import { gql, InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ToastProvider } from 'twenty-ui/primitives/feedback';

import {
  type Application,
  type ApplicationVariable,
  FindOneApplicationDocument,
  UpdateOneApplicationVariableDocument,
} from '~/generated-metadata/graphql';
import { useApplicationVariablesDraft } from '~/pages/settings/applications/hooks/useApplicationVariablesDraft';

const APPLICATION_VARIABLE_FRAGMENT = gql`
  fragment TestApplicationVariableFields on ApplicationVariable {
    id
    key
    value
    description
    isSecret
  }
`;

const VARIABLE_ID = 'var-1';
const KEY = 'API_KEY';
const OLD_VALUE = 'old';
const NEW_VALUE = 'new';
const LATER_VALUE = 'later';

const buildApplicationVariable = (value: string): ApplicationVariable => ({
  __typename: 'ApplicationVariable',
  id: VARIABLE_ID,
  key: KEY,
  value,
  description: '',
  label: '',
  isSecret: false,
  isDeprecated: false,
  isRequired: false,
  type: 'TEXT',
});

const buildApplication = (
  applicationId: string,
  variableValue: string,
): Application => ({
  __typename: 'Application',
  id: applicationId,
  name: 'Test App',
  description: null,
  version: '1.0.0',
  universalIdentifier: 'test-app',
  applicationRegistrationId: null,
  applicationRegistration: null,
  canBeUninstalled: true,
  autoUpgrade: false,
  defaultRoleId: null,
  settingsCustomTabFrontComponentId: null,
  availablePackages: {},
  applicationVariables: [buildApplicationVariable(variableValue)],
  agents: [],
  frontComponents: [],
  commandMenuItems: [],
  settingsMenuItems: [],
  objects: [],
  logicFunctions: [],
});

const renderVariablesDraft = (applicationId: string) => {
  const cache = new InMemoryCache();

  cache.writeQuery({
    query: FindOneApplicationDocument,
    variables: { id: applicationId },
    data: { findOneApplication: buildApplication(applicationId, OLD_VALUE) },
  });

  const findOneApplicationMock = {
    request: {
      query: FindOneApplicationDocument,
      variables: { id: applicationId },
    },
    result: {
      data: {
        findOneApplication: buildApplication(applicationId, NEW_VALUE),
      },
    },
    // The hook watches the application and refetches it once the save
    // completes, so the same request is issued more than once.
    maxUsageCount: Number.POSITIVE_INFINITY,
  };

  const mocks = [
    {
      request: {
        query: UpdateOneApplicationVariableDocument,
        variables: { key: KEY, value: NEW_VALUE, applicationId },
      },
      result: { data: { updateOneApplicationVariable: true } },
    },
    findOneApplicationMock,
  ];

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} cache={cache}>
      <ToastProvider>{children}</ToastProvider>
    </MockedProvider>
  );

  const { result } = renderHook(
    () =>
      useApplicationVariablesDraft({
        applicationId,
        applicationVariables: [buildApplicationVariable(OLD_VALUE)],
      }),
    { wrapper },
  );

  return { result, cache };
};

describe('useApplicationVariablesDraft', () => {
  it('has nothing to save before an edit', () => {
    const { result } = renderVariablesDraft('app-untouched');

    expect(result.current.hasUnsavedApplicationVariables).toBe(false);
    expect(result.current.draftApplicationVariables[0].value).toBe(OLD_VALUE);
  });

  it('keeps the edited value unsaved until it is saved', () => {
    const { result } = renderVariablesDraft('app-edited');

    act(() => {
      result.current.setApplicationVariableValue(KEY, NEW_VALUE);
    });

    expect(result.current.draftApplicationVariables[0].value).toBe(NEW_VALUE);
    expect(result.current.hasUnsavedApplicationVariables).toBe(true);
  });

  it('persists the edited value once saved', async () => {
    const { result, cache } = renderVariablesDraft('app-saved');

    act(() => {
      result.current.setApplicationVariableValue(KEY, NEW_VALUE);
    });

    await act(async () => {
      await result.current.saveApplicationVariables();
    });

    await waitFor(() => {
      const cached = cache.readFragment<{ value: string }>({
        id: cache.identify({
          __typename: 'ApplicationVariable',
          id: VARIABLE_ID,
        }),
        fragment: APPLICATION_VARIABLE_FRAGMENT,
      });
      expect(cached?.value).toBe(NEW_VALUE);
    });

    expect(result.current.hasUnsavedApplicationVariables).toBe(false);
  });

  it('keeps a value edited while the save is in flight', async () => {
    const { result } = renderVariablesDraft('app-edited-during-save');

    act(() => {
      result.current.setApplicationVariableValue(KEY, NEW_VALUE);
    });

    await act(async () => {
      const savePromise = result.current.saveApplicationVariables();

      result.current.setApplicationVariableValue(KEY, LATER_VALUE);

      await savePromise;
    });

    expect(result.current.draftApplicationVariables[0].value).toBe(LATER_VALUE);
    expect(result.current.hasUnsavedApplicationVariables).toBe(true);
  });
});
