import { Module } from '@nestjs/common';

import { FunctionService } from 'src/engine/core-modules/function/function.service';
import { FunctionResolver } from 'src/engine/core-modules/function/function.resolver';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { FunctionWorkspaceEntity } from 'src/modules/function/stadard-objects/function.workspace-entity';
import { CodeExecutorModule } from 'src/engine/code-executor/code-executor.module';

@Module({
  imports: [
    TwentyORMModule.forFeature([FunctionWorkspaceEntity]),
    CodeExecutorModule,
    FileUploadModule,
    UserModule,
  ],
  providers: [FunctionService, FunctionResolver],
})
export class FunctionModule {}
