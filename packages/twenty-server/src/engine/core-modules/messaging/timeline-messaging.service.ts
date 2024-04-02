import { Injectable } from '@nestjs/common';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { TimelineThreadsWithTotal } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

type TimelineThreadParticipant = {
  personId: string;
  workspaceMemberId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string;
  handle: string;
};

@Injectable()
export class TimelineMessagingService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async getMessagesFromPersonIds(
    workspaceMemberId: string,
    workspaceId: string,
    personIds: string[],
    page: number = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotal> {
    const offset = (page - 1) * pageSize;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const messageThreads:
      | {
          id: string;
          lastMessageReceivedAt: Date;
          lastMessageId: string;
          lastMessageBody: string;
          rowNumber: number;
        }[]
      | undefined = await this.workspaceDataSourceService.executeRawQuery(
      `
      SELECT id,
      "lastMessageReceivedAt",
      "lastMessageId",
      "lastMessageBody"
      FROM
      (SELECT message."messageThreadId" AS id,
      MAX(message."receivedAt") AS "lastMessageReceivedAt",
      message.id AS "lastMessageId",
      message.text AS "lastMessageBody",
      ROW_NUMBER() OVER (PARTITION BY message."messageThreadId" ORDER BY MAX(message."receivedAt") DESC) AS "rowNumber"
      FROM
          ${dataSourceSchema}."message" message 
      LEFT JOIN
          ${dataSourceSchema}."messageParticipant" "messageParticipant" ON "messageParticipant"."messageId" = message.id
      WHERE
          "messageParticipant"."personId" = ANY($1)
      GROUP BY
          message."messageThreadId",
          message.id
      ORDER BY
          message."receivedAt" DESC
      ) AS "messageThreads"
      WHERE
      "rowNumber" = 1
      LIMIT $2
      OFFSET $3
        `,
      [personIds, pageSize, offset],
      workspaceId,
    );

    if (!messageThreads) {
      return {
        totalNumberOfThreads: 0,
        timelineThreads: [],
      };
    }

    const messageThreadIds = messageThreads.map(
      (messageThread) => messageThread.id,
    );

    const threadSubjects:
      | {
          id: string;
          subject: string;
        }[]
      | undefined = await this.workspaceDataSourceService.executeRawQuery(
      `
      SELECT *
      FROM
      (SELECT
        message."messageThreadId" AS id,
        message.subject,
        ROW_NUMBER() OVER (PARTITION BY message."messageThreadId" ORDER BY MAX(message."receivedAt") ASC) AS "rowNumber"
      FROM
          ${dataSourceSchema}."message" message
      WHERE
          message."messageThreadId" = ANY($1)
      GROUP BY
          message."messageThreadId",
          message.id
      ORDER BY
          message."receivedAt" DESC
      ) AS "messageThreads"
      WHERE
      "rowNumber" = 1
      `,
      [messageThreadIds],
      workspaceId,
    );

    const numberOfMessagesInThread:
      | {
          id: string;
          numberOfMessagesInThread: number;
        }[]
      | undefined = await this.workspaceDataSourceService.executeRawQuery(
      `
      SELECT
          message."messageThreadId" AS id,
          COUNT(message.id) AS "numberOfMessagesInThread"
      FROM
          ${dataSourceSchema}."message" message
      WHERE
          message."messageThreadId" = ANY($1)
      GROUP BY
          message."messageThreadId"
      `,
      [messageThreadIds],
      workspaceId,
    );

    const messageThreadsByMessageThreadId: {
      [key: string]: {
        id: string;
        lastMessageReceivedAt: Date;
        lastMessageBody: string;
      };
    } = messageThreads.reduce((messageThreadAcc, messageThread) => {
      messageThreadAcc[messageThread.id] = messageThread;

      return messageThreadAcc;
    }, {});

    const subjectsByMessageThreadId:
      | {
          [key: string]: {
            id: string;
            subject: string;
          };
        }
      | undefined = threadSubjects?.reduce(
      (threadSubjectAcc, threadSubject) => {
        threadSubjectAcc[threadSubject.id] = threadSubject;

        return threadSubjectAcc;
      },
      {},
    );

    const numberOfMessagesByMessageThreadId:
      | {
          [key: string]: {
            id: string;
            numberOfMessagesInThread: number;
          };
        }
      | undefined = numberOfMessagesInThread?.reduce(
      (numberOfMessagesAcc, numberOfMessages) => {
        numberOfMessagesAcc[numberOfMessages.id] = numberOfMessages;

        return numberOfMessagesAcc;
      },
      {},
    );

    const threadMessagesParticipants:
      | {
          id: string;
          messageId: string;
          receivedAt: Date;
          body: string;
          subject: string;
          role: string;
          personId: string;
          workspaceMemberId: string;
          handle: string;
          personFirstName: string;
          personLastName: string;
          personAvatarUrl: string;
          workspaceMemberFirstName: string;
          workspaceMemberLastName: string;
          workspaceMemberAvatarUrl: string;
          messageDisplayName: string;
        }[]
      | undefined = await this.workspaceDataSourceService.executeRawQuery(
      `
      SELECT DISTINCT message."messageThreadId" AS id,
        message.id AS "messageId",
        message."receivedAt",
        message.text,
        message."subject",
        "messageParticipant"."role",
        "messageParticipant"."personId",
        "messageParticipant"."workspaceMemberId",
        "messageParticipant".handle,
        "person"."nameFirstName" as "personFirstName",
        "person"."nameLastName" as "personLastName",
        "person"."avatarUrl" as "personAvatarUrl",
        "workspaceMember"."nameFirstName" as "workspaceMemberFirstName",
        "workspaceMember"."nameLastName" as "workspaceMemberLastName",
        "workspaceMember"."avatarUrl" as "workspaceMemberAvatarUrl",
        "messageParticipant"."displayName" as "messageDisplayName"
        FROM
            ${dataSourceSchema}."message" message
        LEFT JOIN
            ${dataSourceSchema}."messageParticipant" "messageParticipant" ON "messageParticipant"."messageId" = message.id
        LEFT JOIN
            ${dataSourceSchema}."person" person ON person."id" = "messageParticipant"."personId"
        LEFT JOIN
            ${dataSourceSchema}."workspaceMember" "workspaceMember" ON "workspaceMember".id = "messageParticipant"."workspaceMemberId"
        WHERE
            message."messageThreadId" = ANY($1)
        ORDER BY
            message."receivedAt" DESC
        `,
      [messageThreadIds],
      workspaceId,
    );

    const threadMessagesFromActiveParticipants =
      threadMessagesParticipants?.filter(
        (threadMessage) => threadMessage.role === 'from',
      );

    const totalNumberOfThreads =
      await this.workspaceDataSourceService.executeRawQuery(
        `
      SELECT COUNT(DISTINCT message."messageThreadId")
      FROM
          ${dataSourceSchema}."message" message 
      LEFT JOIN
          ${dataSourceSchema}."messageParticipant" "messageParticipant" ON "messageParticipant"."messageId" = message.id
      WHERE
          "messageParticipant"."personId" = ANY($1)
      `,
        [personIds],
        workspaceId,
      );

    const threadActiveParticipantsByThreadId: {
      [key: string]: TimelineThreadParticipant[];
    } = messageThreadIds.reduce((messageThreadIdAcc, messageThreadId) => {
      const threadMessages = threadMessagesFromActiveParticipants?.filter(
        (threadMessage) => threadMessage.id === messageThreadId,
      );

      const threadActiveParticipants = threadMessages?.reduce(
        (
          threadMessageAcc,
          threadMessage,
        ): {
          [key: string]: TimelineThreadParticipant;
        } => {
          const threadParticipant = threadMessageAcc[threadMessage.handle];

          const firstName =
            threadMessage.personFirstName ||
            threadMessage.workspaceMemberFirstName ||
            '';

          const lastName =
            threadMessage.personLastName ||
            threadMessage.workspaceMemberLastName ||
            '';

          const displayName =
            firstName ||
            threadMessage.messageDisplayName ||
            threadMessage.handle;

          if (!threadParticipant) {
            threadMessageAcc[threadMessage.handle] = {
              personId: threadMessage.personId,
              workspaceMemberId: threadMessage.workspaceMemberId,
              firstName,
              lastName,
              displayName,
              avatarUrl:
                threadMessage.personAvatarUrl ??
                threadMessage.workspaceMemberAvatarUrl ??
                '',
              handle: threadMessage.handle,
            };
          }

          return threadMessageAcc;
        },
        {},
      );

      messageThreadIdAcc[messageThreadId] = threadActiveParticipants
        ? Object.values(threadActiveParticipants)
        : [];

      return messageThreadIdAcc;
    }, {});

    const messageThreadIdsForWhichWorkspaceMemberIsNotInParticipants =
      messageThreadIds.reduce(
        (
          messageThreadIdsForWhichWorkspaceMemberIsInNotParticipantsAcc: string[],
          messageThreadId,
        ) => {
          const threadMessagesWithWorkspaceMemberInParticipants =
            threadMessagesParticipants?.filter(
              (threadMessage) =>
                threadMessage.id === messageThreadId &&
                threadMessage.workspaceMemberId === workspaceMemberId,
            ) ?? [];

          if (threadMessagesWithWorkspaceMemberInParticipants.length === 0)
            messageThreadIdsForWhichWorkspaceMemberIsInNotParticipantsAcc.push(
              messageThreadId,
            );

          return messageThreadIdsForWhichWorkspaceMemberIsInNotParticipantsAcc;
        },
        [],
      );

    const threadVisibility:
      | {
          id: string;
          visibility: 'metadata' | 'subject' | 'share_everything';
        }[]
      | undefined = await this.workspaceDataSourceService.executeRawQuery(
      `
      SELECT
          message."messageThreadId" AS id,
          "messageChannel".visibility
      FROM
          ${dataSourceSchema}."message" message
      LEFT JOIN
          ${dataSourceSchema}."messageChannelMessageAssociation" "messageChannelMessageAssociation" ON "messageChannelMessageAssociation"."messageId" = message.id
      LEFT JOIN
          ${dataSourceSchema}."messageChannel" "messageChannel" ON "messageChannel".id = "messageChannelMessageAssociation"."messageChannelId"
      WHERE
          message."messageThreadId" = ANY($1)
      `,
      [messageThreadIdsForWhichWorkspaceMemberIsNotInParticipants],
      workspaceId,
    );

    const visibilityValues = ['metadata', 'subject', 'share_everything'];

    const threadVisibilityByThreadIdForWhichWorkspaceMemberIsNotInParticipants:
      | {
          [key: string]: 'metadata' | 'subject' | 'share_everything';
        }
      | undefined = threadVisibility?.reduce(
      (threadVisibilityAcc, threadVisibility) => {
        threadVisibilityAcc[threadVisibility.id] =
          visibilityValues[
            Math.max(
              visibilityValues.indexOf(threadVisibility.visibility),
              visibilityValues.indexOf(
                threadVisibilityAcc[threadVisibility.id] ?? 'metadata',
              ),
            )
          ];

        return threadVisibilityAcc;
      },
      {},
    );

    const threadVisibilityByThreadId: {
      [key: string]: 'metadata' | 'subject' | 'share_everything';
    } = messageThreadIds.reduce((threadVisibilityAcc, messageThreadId) => {
      // If the workspace member is not in the participants of the thread, use the visibility value from the query
      threadVisibilityAcc[messageThreadId] =
        messageThreadIdsForWhichWorkspaceMemberIsNotInParticipants.includes(
          messageThreadId,
        )
          ? threadVisibilityByThreadIdForWhichWorkspaceMemberIsNotInParticipants?.[
              messageThreadId
            ] ?? 'metadata'
          : 'share_everything';

      return threadVisibilityAcc;
    }, {});

    const timelineThreads = messageThreadIds.map((messageThreadId) => {
      const threadActiveParticipants =
        threadActiveParticipantsByThreadId[messageThreadId];

      const firstParticipant = threadActiveParticipants[0];

      const threadActiveParticipantsWithoutFirstParticipant =
        threadActiveParticipants.filter(
          (threadParticipant) =>
            threadParticipant.handle !== firstParticipant.handle,
        );

      const lastTwoParticipants: TimelineThreadParticipant[] = [];

      const lastParticipant =
        threadActiveParticipantsWithoutFirstParticipant.slice(-1)[0];

      if (lastParticipant) {
        lastTwoParticipants.push(lastParticipant);

        const threadActiveParticipantsWithoutFirstAndLastParticipants =
          threadActiveParticipantsWithoutFirstParticipant.filter(
            (threadParticipant) =>
              threadParticipant.handle !== lastParticipant.handle,
          );

        if (threadActiveParticipantsWithoutFirstAndLastParticipants.length > 0)
          lastTwoParticipants.push(
            threadActiveParticipantsWithoutFirstAndLastParticipants.slice(
              -1,
            )[0],
          );
      }

      const thread = messageThreadsByMessageThreadId[messageThreadId];

      const threadSubject =
        subjectsByMessageThreadId?.[messageThreadId].subject ?? '';

      const numberOfMessages =
        numberOfMessagesByMessageThreadId?.[messageThreadId]
          .numberOfMessagesInThread ?? 1;

      return {
        id: messageThreadId,
        read: true,
        firstParticipant,
        lastTwoParticipants,
        lastMessageReceivedAt: thread.lastMessageReceivedAt,
        lastMessageBody: thread.lastMessageBody,
        visibility: threadVisibilityByThreadId?.[messageThreadId] ?? 'metadata',
        subject: threadSubject,
        numberOfMessagesInThread: numberOfMessages,
        participantCount: threadActiveParticipants.length,
      };
    });

    return {
      totalNumberOfThreads: totalNumberOfThreads[0]?.count ?? 0,
      timelineThreads,
    };
  }

  async getMessagesFromCompanyId(
    workspaceMemberId: string,
    workspaceId: string,
    companyId: string,
    page: number = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotal> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const personIds = await this.workspaceDataSourceService.executeRawQuery(
      `
        SELECT 
            p."id"
        FROM
            ${dataSourceSchema}."person" p
        WHERE
            p."companyId" = $1
        `,
      [companyId],
      workspaceId,
    );

    if (!personIds) {
      return {
        totalNumberOfThreads: 0,
        timelineThreads: [],
      };
    }

    const formattedPersonIds = personIds.map(
      (personId: { id: string }) => personId.id,
    );

    const messageThreads = await this.getMessagesFromPersonIds(
      workspaceMemberId,
      workspaceId,
      formattedPersonIds,
      page,
      pageSize,
    );

    return messageThreads;
  }
}
