import { Module } from '@nestjs/common';

import { WellKnownController } from 'src/engine/core-modules/well-known/controllers/well-known.controller';

@Module({
  controllers: [WellKnownController],
})
export class WellKnownModule {}
