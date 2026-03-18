import { Module } from '@nestjs/common';

import { StateTransitionValidatorService } from 'src/engine/core-modules/state-transition/state-transition-validator.service';

@Module({
  providers: [StateTransitionValidatorService],
  exports: [StateTransitionValidatorService],
})
export class StateTransitionValidatorModule {}
