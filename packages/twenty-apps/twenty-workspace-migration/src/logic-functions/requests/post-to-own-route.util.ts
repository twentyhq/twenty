import { RestApiClient } from 'twenty-client-sdk/rest';
import { TRIGGER_ROUTE_PATH } from "src/constants/trigger-route-path";
import { logger } from "src/logic-functions/utils/logger.util";

const OWN_ROUTE_FLUSH_MS = 5_000;

export const postToOwnRoute = async (): Promise<boolean> => {
  try {
    const client = new RestApiClient();

    await client.post(`/s${TRIGGER_ROUTE_PATH}`, '', {
      signal: AbortSignal.timeout(OWN_ROUTE_FLUSH_MS)
    });

    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      return true;
    }

    if (process.env.NODE_ENV !== 'test') {
      logger.error(
        `Request to own route ${TRIGGER_ROUTE_PATH} failed to fire: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return false;
  }
};
