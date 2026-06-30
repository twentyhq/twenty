import { gql, InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import {
  type Application,
  FindOneApplicationDocument,
  UpdateOneApplicationVariableDocument,
} from '~/generated-metadata/graphql';
import { useUpdateOneApplicationVariable } from '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable';

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
const APP_ID = 'app-1';
const KEY = 'API_KEY';
const OLD_VALUE = 'old';
const NEW_VALUE = 'new';

const buildApplication = (variableValue: string): Application => ({
  __typename: 'Application',
  id: APP_ID,
  name: 'Test App',
  description: null,
  logo: null,
  version: '1.0.0',
  universalIdentifier: 'test-app',
  applicationRegistrationId: null,
  applicationRegistration: null,
  canBeUninstalled: true,
  defaultRoleId: null,
  settingsCustomTabFrontComponentId: null,
  availablePackages: {},
  applicationVariables: [
    {
      __typename: 'ApplicationVariable',
      id: VARIABLE_ID,
      key: KEY,
      value: variableValue,
      description: '',
      isSecret: false,
    },
  ],
  agents: [],
  frontComponents: [],
  commandMenuItems: [],
  objects: [],
  logicFunctions: [],
});

describe('useUpdateOneApplicationVariable', () => {
  it('updates the cached ApplicationVariable value after the mutation completes', async () => {
    const cache = new InMemoryCache();

    cache.writeQuery({
      query: FindOneApplicationDocument,
      variables: { id: APP_ID },
      data: { findOneApplication: buildApplication(OLD_VALUE) },
    });

    const mocks = [
      {
        request: {
          query: UpdateOneApplicationVariableDocument,
          variables: { key: KEY, value: NEW_VALUE, applicationId: APP_ID },
        },
        result: { data: { updateOneApplicationVariable: true } },
      },
      {
        request: {
          query: FindOneApplicationDocument,
          variables: { id: APP_ID },
        },
        result: { data: { findOneApplication: buildApplication(NEW_VALUE) } },
      },
    ];

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks} cache={cache}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useUpdateOneApplicationVariable(), {
      wrapper,
    });

    await act(async () => {
      await result.current.updateOneApplicationVariable({
        key: KEY,
        value: NEW_VALUE,
        applicationId: APP_ID,
      });
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
  });
});
