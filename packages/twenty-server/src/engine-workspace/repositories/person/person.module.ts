import { Module } from '@nestjs/common';

import { PersonService } from 'src/engine-workspace/repositories/person/person.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
