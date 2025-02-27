import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';
import { PlaygroundSessionService } from '@/settings/playground/utils/playgroundSessionService';
import { isDefined } from 'twenty-shared';

export const PLAYGROUND_API_KEY = 'apiKeyForPlayground';
export const PLAYGROUND_SCHEMA = 'apiSchemaForPlayground';

type PlaygroundSessionValid = {
  apiKey: string;
  schema: PlaygroundSchemas;
  isValid: true;
};

type PlaygroundSessionInvalid = {
  apiKey: null;
  schema: null;
  isValid: false;
};

type PlaygroundSession = PlaygroundSessionValid | PlaygroundSessionInvalid;

export const usePlaygroundSession = (): PlaygroundSession => {
  const apiKey = PlaygroundSessionService.get(PlaygroundSessionKeys.API_KEY);
  const schema = PlaygroundSessionService.get(PlaygroundSessionKeys.SCHEMA);

  const isValid = isDefined(apiKey) && isDefined(schema);

  if (isValid) {
    return {
      apiKey: apiKey as string,
      schema: schema as PlaygroundSchemas,
      isValid: true,
    };
  }

  return { apiKey: null, schema: null, isValid: false };
};
