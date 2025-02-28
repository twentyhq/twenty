import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';
import { PlaygroundSessionService } from '@/settings/playground/utils/playgroundSessionService';
import { setPlaygroundSession } from '@/settings/playground/utils/setPlaygroundSession';

describe('useSetPlaygroundSession hook', () => {
  let sessionStorageMock: Record<string, string> = {};

  beforeEach(() => {
    jest.spyOn(PlaygroundSessionService, 'get').mockImplementation((key) => {
      return sessionStorageMock[key] || null;
    });
    jest
      .spyOn(PlaygroundSessionService, 'set')
      .mockImplementation((key, value) => {
        sessionStorageMock[key] = String(value);
      });
  });

  afterEach(() => {
    sessionStorageMock = {};
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it(`should store ${PlaygroundSessionKeys.API_KEY} and ${PlaygroundSessionKeys.SCHEMA} through PlaygroundSessionService`, () => {
    const mockApiKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzQwNzY1MDk1LCJleHAiOjQ4OTQzNjUwOTQsImp0aSI6ImMzNDMyODhkLTJiM2EtNDgyMS1hODE0LWRmYzNkYjAyNDk5NyJ9.VxPtx3IDWs2UdJ9vk5AQQuk0u4luICrF9use6DFGo0c';
    const mockSchema = PlaygroundSchemas.CORE;
    setPlaygroundSession(mockSchema, mockApiKey);

    expect(PlaygroundSessionService.set).toHaveBeenCalledTimes(2);
    expect(PlaygroundSessionService.set).toHaveBeenCalledWith(
      PlaygroundSessionKeys.API_KEY,
      mockApiKey,
    );

    expect(PlaygroundSessionService.set).toHaveBeenCalledWith(
      PlaygroundSessionKeys.SCHEMA,
      mockSchema,
    );

    expect(PlaygroundSessionService.get(PlaygroundSessionKeys.API_KEY)).toEqual(
      mockApiKey,
    );

    expect(PlaygroundSessionService.get(PlaygroundSessionKeys.SCHEMA)).toEqual(
      mockSchema,
    );
  });

  it('should throw an error when an invalid API key is provided', () => {
    const invalidApiKey = '';
    const validSchema = PlaygroundSchemas.CORE;

    expect(() => setPlaygroundSession(validSchema, invalidApiKey)).toThrowError(
      'Invalid session data',
    );
  });

  it('should throw an error when an invalid schema is provided', () => {
    const mockApiKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzQwNzY1MDk1LCJleHAiOjQ4OTQzNjUwOTQsImp0aSI6ImMzNDMyODhkLTJiM2EtNDgyMS1hODE0LWRmYzNkYjAyNDk5NyJ9.VxPtx3IDWs2UdJ9vk5AQQuk0u4luICrF9use6DFGo0c';
    const invalidSchema = 'INVALID_SCHEMA' as any;

    expect(() => setPlaygroundSession(invalidSchema, mockApiKey)).toThrowError(
      'Invalid session data',
    );
  });
});
