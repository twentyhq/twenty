import { Module } from '@nestjs/common';

import { ValidationGateUpdateOnePreQueryHook } from 'src/engine/core-modules/validation-gate/query-hooks/validation-gate.update-one.pre-query-hook';
import { ValidationGateService } from 'src/engine/core-modules/validation-gate/services/validation-gate.service';

// GlobalWorkspaceOrmManager comes from GlobalWorkspaceDataSourceModule, which is
// @Global(), so it needs no explicit import here.
@Module({
  providers: [ValidationGateService, ValidationGateUpdateOnePreQueryHook],
  exports: [ValidationGateService, ValidationGateUpdateOnePreQueryHook],
})
export class ValidationGateModule {}
