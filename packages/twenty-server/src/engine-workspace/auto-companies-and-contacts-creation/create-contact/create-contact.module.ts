import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CreateContactService } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { PersonModule } from 'src/engine-workspace/repositories/person/person.module';

@Module({
  imports: [WorkspaceDataSourceModule, PersonModule],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
