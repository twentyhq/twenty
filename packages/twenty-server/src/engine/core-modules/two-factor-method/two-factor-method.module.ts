import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

import { TwoFactorMethod } from './two-factor-method.entity';
import { TwoFactorMethodService } from './two-factor-method.service';

@Module({
  imports: [TypeOrmModule.forFeature([TwoFactorMethod, UserWorkspace], 'core')],
  providers: [TwoFactorMethodService],
  exports: [TwoFactorMethodService],
})
export class TwoFactorMethodModule {}
