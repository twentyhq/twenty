import { Module } from '@nestjs/common';

import { FunctionService } from 'src/engine/core-modules/function/function.service';
import { FunctionResolver } from 'src/engine/core-modules/function/function.resolver';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { FunctionWorkspaceEntity } from 'src/modules/function/stadard-objects/function.workspace-entity';

@Module({
  imports: [
    FileUploadModule,
    UserModule,
    TwentyORMModule.forFeature([FunctionWorkspaceEntity]),
  ],
  providers: [FunctionService, FunctionResolver],
})
export class FunctionModule {}
