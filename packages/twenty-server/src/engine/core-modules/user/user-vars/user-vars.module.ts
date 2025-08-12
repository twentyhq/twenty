import { Module } from '@nestjs/common';

import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';

@Module({
  imports: [KeyValuePairModule],
  exports: [UserVarsService],
  providers: [UserVarsService],
})
export class UserVarsModule {}
