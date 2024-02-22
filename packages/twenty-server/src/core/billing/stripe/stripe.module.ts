import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StripeService } from 'src/core/billing/stripe/stripe.service';
import { ConfigurableModuleClass } from 'src/core/billing/stripe/stripe.module-definition';

@Module({
  providers: [StripeService],
  exports: [StripeService],
  imports: [ConfigModule],
})
export class StripeModule extends ConfigurableModuleClass {}
