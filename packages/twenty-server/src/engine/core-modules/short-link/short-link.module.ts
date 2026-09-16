import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { ShortLinkEntity } from 'src/engine/core-modules/short-link/short-link.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [TypeOrmModule.forFeature([ShortLinkEntity])],
  providers: [
    provideWorkspaceScopedRepository(ShortLinkEntity),
    ShortLinkService,
  ],
  exports: [ShortLinkService],
})
export class ShortLinkModule {}
