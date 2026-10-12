import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationRegistrationMetricInput } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-input.type';
import { buildApplicationRegistrationMetricEnvelope } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-metric-envelope.util';
import { hashWorkspaceIdForApplicationRegistrationMetric } from 'src/engine/core-modules/application/application-registration-analytics/utils/hash-workspace-id-for-application-registration-metric.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type RecordApplicationRegistrationMetricParams = Omit<
  ApplicationRegistrationMetricInput,
  'workspaceHash'
> & {
  workspaceId?: string | null;
};

type RecordForApplicationParams = Omit<
  RecordApplicationRegistrationMetricParams,
  'applicationRegistrationId' | 'universalIdentifier' | 'version'
> & {
  application: Pick<
    FlatApplication,
    'applicationRegistrationId' | 'universalIdentifier' | 'version'
  >;
};

// Owner-facing counters: only platform code calls this, and only with values an app owner may see
@Injectable()
export class ApplicationRegistrationMetricService {
  private readonly logger = new Logger(
    ApplicationRegistrationMetricService.name,
  );

  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  record({
    workspaceId,
    ...input
  }: RecordApplicationRegistrationMetricParams): void {
    if (!this.eventLogEmitterService.isEnabled()) {
      return;
    }

    const envelope = buildApplicationRegistrationMetricEnvelope({
      ...input,
      workspaceHash: isDefined(workspaceId)
        ? hashWorkspaceIdForApplicationRegistrationMetric({
            workspaceId,
            secret: this.twentyConfigService.get('APP_SECRET'),
          })
        : null,
    });

    void this.eventLogEmitterService.dispatch([envelope]).catch((error) => {
      this.logger.error(
        `Failed to record application registration metric ${input.metric}`,
        error,
      );
    });
  }

  recordForApplication({
    application,
    ...input
  }: RecordForApplicationParams): void {
    if (!isDefined(application.applicationRegistrationId)) {
      return;
    }

    this.record({
      ...input,
      applicationRegistrationId: application.applicationRegistrationId,
      universalIdentifier: application.universalIdentifier,
      version: application.version,
    });
  }
}
