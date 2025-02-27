import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';
import { PlaygroundSessionService } from '@/settings/playground/utils/playgroundSessionService';

export const useSetPlaygroundSession = () => {
  const setSchema = (schema: PlaygroundSchemas) =>
    PlaygroundSessionService.set(PlaygroundSessionKeys.SCHEMA, schema);
  const setApiKey = (apiKey: string) =>
    PlaygroundSessionService.set(PlaygroundSessionKeys.API_KEY, apiKey);

  return {
    setSchema,
    setApiKey,
  };
};
