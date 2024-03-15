import { Injectable } from '@nestjs/common';

import { CalendarEventService } from 'src/business/modules/calendar/repositories/calendar-event/calendar-event.service';
import { deleteUsingPagination } from 'src/business/modules/message/services/thread-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class CalendarEventCleanerService {
  constructor(private readonly calendarEventService: CalendarEventService) {}

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    await deleteUsingPagination(
      workspaceId,
      500,
      this.calendarEventService.getNonAssociatedCalendarEventIdsPaginated.bind(
        this.calendarEventService,
      ),
      this.calendarEventService.deleteByIds.bind(this.calendarEventService),
    );
  }
}
