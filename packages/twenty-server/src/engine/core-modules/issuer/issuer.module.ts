import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

import { Issuer } from './issuer.entity';
import { IssuerResolver } from './issuer.resolver';
import { IssuerService } from './issuer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issuer, Workspace], 'core'),
    forwardRef(() => WorkspaceModule),
  ],
  providers: [IssuerService, IssuerResolver],
  exports: [IssuerService],
})
export class IssuerModule {}
