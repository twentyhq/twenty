import { Module } from '@nestjs/common';

import { CreateCompanyAndContactService } from 'src/apps/connected-account/auto-companies-and-contacts-creation/services/create-company-and-contact.service';
import { CreateCompanyModule } from 'src/apps/connected-account/auto-companies-and-contacts-creation/create-company/create-company.module';
import { CreateContactModule } from 'src/apps/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { PersonObjectMetadata } from 'src/apps/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/apps/workspace-member/standard-objects/workspace-member.object-metadata';
import { MessageParticipantModule } from 'src/apps/messaging/services/message-participant/message-participant.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CreateCompanyAndContactListener } from 'src/apps/connected-account/auto-companies-and-contacts-creation/listeners/create-company-and-contact.listener';
import { CalendarEventAttendeeObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-event-attendee.object-metadata';
import { CalendarEventAttendeeModule } from 'src/apps/calendar/services/calendar-event-attendee/calendar-event-attendee.module';

@Module({
  imports: [
    CreateContactModule,
    CreateCompanyModule,
    ObjectMetadataRepositoryModule.forFeature([
      PersonObjectMetadata,
      WorkspaceMemberObjectMetadata,
      CalendarEventAttendeeObjectMetadata,
    ]),
    MessageParticipantModule,
    WorkspaceDataSourceModule,
    CalendarEventAttendeeModule,
  ],
  providers: [CreateCompanyAndContactService, CreateCompanyAndContactListener],
  exports: [CreateCompanyAndContactService],
})
export class AutoCompaniesAndContactsCreationModule {}
