import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_PERSONAL_FOLDERS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_FOLDERS_SCHEMA } from 'src/front-components/types/granola-personal-folders.type';

const FOLDERS_RESPONSE_SCHEMA = GRANOLA_PERSONAL_FOLDERS_SCHEMA.extend({
  success: z.literal(true),
});

export const fetchGranolaPersonalFoldersOrThrow = async (
  connectionId: string,
) =>
  FOLDERS_RESPONSE_SCHEMA.parse(
    await new RestApiClient().get(
      '/s' +
        GRANOLA_PERSONAL_FOLDERS_ROUTE_PATH +
        '?' +
        new URLSearchParams({ connectionId }).toString(),
    ),
  );
