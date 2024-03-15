import { Module } from '@nestjs/common';

import { PersonModule } from 'src/engine-workspace/repositories/person/person.module';
import { WorkspaceMemberModule } from 'src/engine-workspace/repositories/workspace-member/workspace-member.module';
import { CreateCompanyAndContactService } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.service';
import { CreateCompanyModule } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-company/create-company.module';
import { CreateContactModule } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-contact/create-contact.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    CreateContactModule,
    CreateCompanyModule,
    WorkspaceMemberModule,
    PersonModule,
  ],
  providers: [CreateCompanyAndContactService],
  exports: [CreateCompanyAndContactService],
})
export class CreateCompaniesAndContactsModule {}
