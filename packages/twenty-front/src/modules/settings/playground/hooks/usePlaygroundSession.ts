import {
  PlaygroundSchemas,
  PlaygroundTypes,
} from '@/settings/playground/types/PlaygroundConfig';
import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';
import { PlaygroundSessionService } from '@/settings/playground/utils/playgroundSessionService';
import { isDefined } from 'twenty-shared';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const PLAYGROUND_API_KEY = 'apiKeyForPlayground';
export const PLAYGROUND_SCHEMA = 'apiSchemaForPlayground';

type PlaygroundSessionValid = {
  apiKey: string;
  schema: PlaygroundSchemas;
  isValid: true;
  baseUrl: string;
};

type PlaygroundSessionInvalid = {
  apiKey: null;
  schema: null;
  isValid: false;
  baseUrl: null;
};

type PlaygroundSession = PlaygroundSessionValid | PlaygroundSessionInvalid;

const SchemaToPath = {
  [PlaygroundSchemas.CORE]: 'graphql',
  [PlaygroundSchemas.METADATA]: 'metadata',
};

export const usePlaygroundSession = (
  playgroundType: PlaygroundTypes,
): PlaygroundSession => {
  const apiKey: string | null = PlaygroundSessionService.get(
    PlaygroundSessionKeys.API_KEY,
  );
  const schema: PlaygroundSchemas | null = PlaygroundSessionService.get(
    PlaygroundSessionKeys.SCHEMA,
  );

  const isValid = isDefined(apiKey) && isDefined(schema);

  if (isValid) {
    const baseUrl =
      playgroundType === PlaygroundTypes.GRAPHQL
        ? REACT_APP_SERVER_BASE_URL + '/' + SchemaToPath[schema]
        : REACT_APP_SERVER_BASE_URL + '/' + schema;

    return {
      apiKey: apiKey,
      schema: schema,
      isValid: true,
      baseUrl,
    };
  }

  return { apiKey: null, schema: null, isValid: false, baseUrl: null };
};
