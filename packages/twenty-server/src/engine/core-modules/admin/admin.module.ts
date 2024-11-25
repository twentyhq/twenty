import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { User } from 'src/engine/core-modules/user/user.entity';

import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User], 'core'), AuthModule],
  providers: [AdminResolver, AdminService],
  exports: [AdminService],
})
export class AdminModule {}
