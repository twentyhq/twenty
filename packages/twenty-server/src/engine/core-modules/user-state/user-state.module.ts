import { Module } from '@nestjs/common';

import { UserStateService } from 'src/engine/core-modules/user-state/user-state.service';
import { UserStateResolver } from 'src/engine/core-modules/user-state/user-state.resolver';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';

@Module({
  imports: [DataSourceModule, KeyValuePairModule],
  exports: [UserStateService],
  providers: [UserStateService, UserStateResolver],
})
export class UserStateModule {}
