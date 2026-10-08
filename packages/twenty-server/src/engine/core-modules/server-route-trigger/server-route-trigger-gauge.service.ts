import { Injectable, OnModuleInit } from '@nestjs/common';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { ServerRouteReachabilityService } from 'src/engine/core-modules/server-route-trigger/server-route-reachability.service';

@Injectable()
export class ServerRouteTriggerGaugeService implements OnModuleInit {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly serverRouteReachabilityService: ServerRouteReachabilityService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_app_server_route_unreachable_workspaces',
      options: {
        description:
          'Number of workspaces where an application exposes a server route that cannot be reached because its owner workspace does not serve it',
      },
      callback: async () => {
        const unreachableRegistrations =
          await this.serverRouteReachabilityService.findUnreachableServerRouteRegistrations();

        return unreachableRegistrations.map((unreachableRegistration) => ({
          value: unreachableRegistration.unreachableWorkspaceCount,
          attributes: {
            universal_identifier: unreachableRegistration.universalIdentifier,
            app_name: unreachableRegistration.name,
          },
        }));
      },
      cacheValue: true,
    });
  }
}
