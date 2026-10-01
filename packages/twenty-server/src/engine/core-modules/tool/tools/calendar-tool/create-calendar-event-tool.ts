import { Injectable, Logger } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CreateCalendarEventToolInputZodSchema } from 'src/engine/core-modules/tool/tools/calendar-tool/calendar-tool.schema';
import { type CreateCalendarEventToolInput } from 'src/engine/core-modules/tool/tools/calendar-tool/types/create-calendar-event-tool-input.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { CalendarEventCreationException } from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { CalendarEventComposerService } from 'src/modules/calendar/calendar-event-creation-manager/services/calendar-event-composer.service';
import { CreateCalendarEventService } from 'src/modules/calendar/calendar-event-creation-manager/services/create-calendar-event.service';

@Injectable()
export class CreateCalendarEventTool implements Tool {
  private readonly logger = new Logger(CreateCalendarEventTool.name);

  description =
    'Create a calendar event on a connected Google or Microsoft account. Requires CREATE_CALENDAR_EVENT_TOOL permission. Set sendInvitations to true to attach attendees and email them an invitation; when false the event is created with no attendees and nobody is notified.';
  inputSchema = CreateCalendarEventToolInputZodSchema;
  flag = PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL;

  constructor(
    private readonly calendarEventComposerService: CalendarEventComposerService,
    private readonly createCalendarEventService: CreateCalendarEventService,
  ) {}

  async execute(
    parameters: CreateCalendarEventToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    try {
      const result =
        await this.calendarEventComposerService.composeCalendarEvent(
          parameters,
          context.workspaceId,
        );

      if (!result.success) {
        return {
          success: false,
          message: 'Failed to create calendar event',
          error: result.error,
        };
      }

      const { data } = result;

      const createdEvent =
        await this.createCalendarEventService.createComposedCalendarEvent(data);

      await this.createCalendarEventService.persistCalendarEvent(
        createdEvent,
        data,
        context.workspaceId,
      );

      this.logger.log(
        `Calendar event "${createdEvent.title}" created on connected account ${data.connectedAccount.id}`,
      );

      return {
        success: true,
        message: `Calendar event "${createdEvent.title}" created`,
        result: {
          iCalUid: createdEvent.iCalUid,
          externalEventId: createdEvent.id,
          title: createdEvent.title,
          startsAt: createdEvent.startsAt,
          endsAt: createdEvent.endsAt,
          conferenceLink: createdEvent.conferenceLinkUrl || undefined,
          attendeeCount: createdEvent.participants.length,
          connectedAccountId: data.connectedAccount.id,
        },
      };
    } catch (error) {
      if (error instanceof CalendarEventCreationException) {
        return {
          success: false,
          message: 'Failed to create calendar event',
          error: error.message,
        };
      }

      this.logger.error(`Failed to create calendar event: ${error}`);

      return {
        success: false,
        message: 'Failed to create calendar event',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create calendar event',
      };
    }
  }
}
