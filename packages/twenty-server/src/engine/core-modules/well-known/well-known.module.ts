import { Module } from '@nestjs/common';

import { WellKnownController } from 'src/engine/core-modules/well-known/controllers/well-known.controller';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [TwentyConfigModule],
  controllers: [WellKnownController],
})
export class WellKnownModule {}
