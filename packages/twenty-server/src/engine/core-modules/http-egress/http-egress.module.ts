import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { HttpEgressService } from 'src/engine/core-modules/http-egress/http-egress.service';
import { HttpEgressAdmissionService } from 'src/engine/core-modules/http-egress/services/http-egress-admission.service';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';

@Module({
  imports: [
    BillingModule,
    MetricsModule,
    SecureHttpClientModule,
    ThrottlerModule,
  ],
  providers: [HttpEgressService, HttpEgressAdmissionService],
  exports: [HttpEgressService],
})
export class HttpEgressModule {}
