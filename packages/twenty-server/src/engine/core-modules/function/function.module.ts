import { Module } from '@nestjs/common';

import { FunctionService } from 'src/engine/core-modules/function/function.service';
import { FunctionResolver } from 'src/engine/core-modules/function/function.resolver';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { FunctionWorkspaceEntity } from 'src/modules/function/standard-objects/function.workspace-entity';
import { CustomCodeEngineModule } from 'src/engine/integrations/custom-code-engine/custom-code-engine.module';

@Module({
  imports: [
    TwentyORMModule.forFeature([FunctionWorkspaceEntity]),
    CustomCodeEngineModule,
    UserModule,
  ],
  providers: [FunctionService, FunctionResolver],
})
export class FunctionModule {}
