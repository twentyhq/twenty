import { Module } from '@nestjs/common';

import { HttpControllerValidationPipe } from 'src/engine/core-modules/http-controller/pipes/http-controller-validation.pipe';

@Module({
  providers: [HttpControllerValidationPipe],
  exports: [HttpControllerValidationPipe],
})
export class HttpControllerModule {}
