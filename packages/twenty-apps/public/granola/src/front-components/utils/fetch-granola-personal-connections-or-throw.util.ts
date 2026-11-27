import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_FOLDERS_SCHEMA } from 'src/front-components/types/granola-personal-folders.type';

const GRANOLA_CONNECTIONS_RESPONSE_SCHEMA = z.object({
  success: z.literal(true),
  connections: z.array(z.object({ id: z.string(), name: z.string() })),
  firstConnectionFolders: GRANOLA_PERSONAL_FOLDERS_SCHEMA.nullable(),
});

export const fetchGranolaPersonalConnectionsOrThrow = async () => {
  const { connections, firstConnectionFolders } =
    GRANOLA_CONNECTIONS_RESPONSE_SCHEMA.parse(
      await new RestApiClient().get(
        '/s' + GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH,
      ),
    );

  return { connections, firstConnectionFolders };
};
