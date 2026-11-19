import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';

const GRANOLA_CONNECTIONS_RESPONSE_SCHEMA = z.object({
  success: z.literal(true),
  connections: z.array(z.object({ id: z.string(), name: z.string() })),
});

export const fetchGranolaPersonalConnectionsOrThrow = async () => {
  const result = GRANOLA_CONNECTIONS_RESPONSE_SCHEMA.parse(
    await new RestApiClient().get(
      '/s' + GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH,
    ),
  );

  return result.connections;
};
