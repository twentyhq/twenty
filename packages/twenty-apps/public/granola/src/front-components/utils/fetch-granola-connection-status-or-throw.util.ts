import { RestApiClient } from 'twenty-client-sdk/rest';

import { GRANOLA_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/granola-connection-status-route-path';
import {
  GRANOLA_CONNECTION_STATUS_SCHEMA,
  type GranolaConnectionStatus,
} from 'src/front-components/types/granola-connection-status.type';

export const fetchGranolaConnectionStatusOrThrow =
  async (): Promise<GranolaConnectionStatus> =>
    GRANOLA_CONNECTION_STATUS_SCHEMA.parse(
      await new RestApiClient().get(
        `/s${GRANOLA_CONNECTION_STATUS_ROUTE_PATH}`,
      ),
    );
