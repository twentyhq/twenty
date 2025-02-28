import {
  SchemaToPath,
  usePlaygroundSession,
  usePlaygroundSessionResult,
} from '@/settings/playground/hooks/usePlaygroundSession';
import {
  PlaygroundSchemas,
  PlaygroundTypes,
} from '@/settings/playground/types/PlaygroundConfig';
import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';
import { PlaygroundSessionService } from '@/settings/playground/utils/playgroundSessionService';
import { renderHook } from '@testing-library/react';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

jest.mock('@/settings/playground/utils/playgroundSessionService');

const expectInvalidSession = (result: usePlaygroundSessionResult) => {
  expect(result.isValid).toBe(false);
  expect(result.apiKey).toBeNull();
  expect(result.schema).toBeNull();
  expect(result.baseUrl).toBeNull();
};

const expectValidSession = (
  result: usePlaygroundSessionResult,
  apiKey: string,
  schema: string,
  expectedBaseUrl: string,
) => {
  expect(result.isValid).toBe(true);
  expect(result.apiKey).toBe(apiKey);
  expect(result.schema).toBe(schema);
  expect(result.baseUrl).toBe(expectedBaseUrl);
};

const renderBothHooks = () => {
  const { result: graphQlResult } = renderHook(() =>
    usePlaygroundSession(PlaygroundTypes.GRAPHQL),
  );
  const { result: restResult } = renderHook(() =>
    usePlaygroundSession(PlaygroundTypes.REST),
  );
  return { graphQlResult, restResult };
};

const mockSessionService = (apiKeyValue: any, schemaValue: any) => {
  return jest
    .spyOn(PlaygroundSessionService, 'get')
    .mockImplementation((key) => {
      if (key === PlaygroundSessionKeys.API_KEY) return apiKeyValue;
      if (key === PlaygroundSessionKeys.SCHEMA) return schemaValue;
      return null;
    });
};

describe('usePlaygroundSession', () => {
  const mockApiKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzQwNzY1MDk1LCJleHAiOjQ4OTQzNjUwOTQsImp0aSI6ImMzNDMyODhkLTJiM2EtNDgyMS1hODE0LWRmYzNkYjAyNDk5NyJ9.VxPtx3IDWs2UdJ9vk5AQQuk0u4luICrF9use6DFGo0c';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([PlaygroundSchemas.CORE, PlaygroundSchemas.METADATA])(
    'should return a valid session for the %s schema with API key and correct base URL',
    (mockSchema) => {
      mockSessionService(mockApiKey, mockSchema);

      const { graphQlResult, restResult } = renderBothHooks();

      expectValidSession(
        graphQlResult.current,
        mockApiKey,
        mockSchema,
        `${REACT_APP_SERVER_BASE_URL}/${SchemaToPath[mockSchema]}`,
      );

      expectValidSession(
        restResult.current,
        mockApiKey,
        mockSchema,
        `${REACT_APP_SERVER_BASE_URL}/${mockSchema}`,
      );
    },
  );

  it.each([
    ['session is missing API key', null, PlaygroundSchemas.METADATA],
    ['session is missing schema', mockApiKey, null],
    ['session is missing both API key and schema', null, null],
    [
      'an unsupported PlaygroundType is provided',
      'INVALID_PLAYGROUND_TYPE',
      null,
    ],
    ['empty strings are provdied', '', ''],
    ['numeric values are provided', 123, 123],
    ['invalid schema is provided', mockApiKey, 'INVALID_SCHEMA'],
  ])(
    'should return an invalid session when %s',
    (_, apiKeyValue, schemaValue) => {
      mockSessionService(apiKeyValue, schemaValue);
      const { graphQlResult, restResult } = renderBothHooks();

      expectInvalidSession(graphQlResult.current);
      expectInvalidSession(restResult.current);
    },
  );

  it('should handle errors in PlaygroundSessionService gracefully', () => {
    jest.spyOn(PlaygroundSessionService, 'get').mockImplementation(() => {
      throw new Error('Something went wrong');
    });

    const { graphQlResult, restResult } = renderBothHooks();

    expectInvalidSession(graphQlResult.current);
    expectInvalidSession(restResult.current);
  });
});
