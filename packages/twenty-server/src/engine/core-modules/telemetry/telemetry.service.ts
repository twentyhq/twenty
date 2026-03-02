import { Injectable } from '@nestjs/common';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import { TelemetryEventType } from 'src/engine/core-modules/telemetry/telemetry-event.type';

type TelemetrySignUpEvent = {
  action: typeof USER_SIGNUP_EVENT_NAME;
  events: TelemetryEventType[];
};

type TelemetryEventPayload = TelemetrySignUpEvent;

@Injectable()
export class TelemetryService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async publish(payload: TelemetryEventPayload) {
    if (!this.twentyConfigService.get('TELEMETRY_ENABLED')) {
      return { success: true };
    }

    try {
      const httpClient = this.secureHttpClientService.getHttpClient({
        baseURL: 'https://twenty-telemetry.com/api/v2',
      });

      await Promise.all(
        payload.events.map((event) =>
          httpClient.post(`/selfHostingEvent`, {
            action: payload.action,
            ...event,
          }),
        ),
      );
    } catch {
      return { success: false };
    }

    return { success: true };
  }
}
