import {
  PlaygroundSchemas,
  PlaygroundTypes,
} from '@/settings/playground/types/PlaygroundConfig';
import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';
import { PlaygroundSessionService } from '@/settings/playground/utils/playgroundSessionService';
import { PlaygroundSessionSchema } from '@/settings/playground/utils/sessionSchema';
import { isDefined } from 'twenty-shared';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const PLAYGROUND_API_KEY = 'apiKeyForPlayground';
export const PLAYGROUND_SCHEMA = 'apiSchemaForPlayground';

export const SchemaToPath = {
  [PlaygroundSchemas.CORE]: 'graphql',
  [PlaygroundSchemas.METADATA]: 'metadata',
};

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

export type usePlaygroundSessionResult =
  | PlaygroundSessionValid
  | PlaygroundSessionInvalid;

export const usePlaygroundSession = (
  playgroundType: PlaygroundTypes,
): usePlaygroundSessionResult => {
  try {
    const apiKey: string | null = PlaygroundSessionService.get(
      PlaygroundSessionKeys.API_KEY,
    );
    const schema: PlaygroundSchemas | null = PlaygroundSessionService.get(
      PlaygroundSessionKeys.SCHEMA,
    );

    const isValid =
      isDefined(apiKey) &&
      isDefined(schema) &&
      PlaygroundSessionSchema.safeParse({ apiKey, schema }).success;

    if (!isValid) {
      throw Error('Invalid playground setup');
    }

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
  } catch (e) {
    return { apiKey: null, schema: null, isValid: false, baseUrl: null };
  }
};
