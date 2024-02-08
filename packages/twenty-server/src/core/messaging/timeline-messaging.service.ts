import { Injectable } from '@nestjs/common';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/core/messaging/constants/messaging.constants';
import { TimelineThreadsWithTotal } from 'src/core/messaging/dtos/timeline-threads-with-total.dto';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';

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
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {}

  async getMessagesFromPersonIds(
    workspaceId: string,
    personIds: string[],
    page: number = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotal> {
    const offset = (page - 1) * pageSize;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const messageThreads:
      | {
          id: string;
          lastMessageReceivedAt: Date;
          lastMessageId: string;
          lastMessageBody: string;
          rowNumber: number;
        }[]
      | undefined = await workspaceDataSource?.query(
      `
      SELECT *
      FROM
      (SELECT "messageThread".id,
      MAX(message."receivedAt") AS "lastMessageReceivedAt",
      message.id AS "lastMessageId",
      message.text AS "lastMessageBody",
      ROW_NUMBER() OVER (PARTITION BY "messageThread".id ORDER BY MAX(message."receivedAt") DESC) AS "rowNumber"
      FROM
          ${dataSourceMetadata.schema}."message" message 
      LEFT JOIN
          ${dataSourceMetadata.schema}."messageThread" "messageThread" ON "messageThread".id = message."messageThreadId"
      LEFT JOIN
          ${dataSourceMetadata.schema}."messageParticipant" "messageParticipant" ON "messageParticipant"."messageId" = message.id
      LEFT JOIN
          ${dataSourceMetadata.schema}."person" person ON person.id = "messageParticipant"."personId"
      LEFT JOIN
          ${dataSourceMetadata.schema}."workspaceMember" "workspaceMember" ON "workspaceMember".id = "messageParticipant"."workspaceMemberId"
      WHERE
          person.id = ANY($1)
      GROUP BY
          "messageThread".id,
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
      | undefined = await workspaceDataSource?.query(
      `
      SELECT *
      FROM
      (SELECT
        "messageThread".id,
        message.subject,
        ROW_NUMBER() OVER (PARTITION BY "messageThread".id ORDER BY MAX(message."receivedAt") ASC) AS "rowNumber"
      FROM
          ${dataSourceMetadata.schema}."message" message
      LEFT JOIN
          ${dataSourceMetadata.schema}."messageThread" "messageThread" ON "messageThread".id = message."messageThreadId"
      WHERE
          "messageThread".id = ANY($1)
      GROUP BY
          "messageThread".id,
          message.id
      ORDER BY
          message."receivedAt" DESC
      ) AS "messageThreads"
      WHERE
      "rowNumber" = 1
      `,
      [messageThreadIds],
    );

    const numberOfMessagesInThread:
      | {
          id: string;
          numberOfMessagesInThread: number;
        }[]
      | undefined = await workspaceDataSource?.query(
      `
      SELECT
          "messageThread".id,
          COUNT(message.id) AS "numberOfMessagesInThread"
      FROM
          ${dataSourceMetadata.schema}."message" message
      LEFT JOIN
          ${dataSourceMetadata.schema}."messageThread" "messageThread" ON "messageThread".id = message."messageThreadId"
      WHERE
          "messageThread".id = ANY($1)
      GROUP BY
          "messageThread".id
      `,
      [messageThreadIds],
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

    const threadMessagesFromActiveParticipants:
      | {
          id: string;
          messageId: string;
          receivedAt: Date;
          body: string;
          subject: string;
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
      | undefined = await workspaceDataSource?.query(
      `
      SELECT DISTINCT "messageThread".id,
        message.id AS "messageId",
        message."receivedAt",
        message.text,
        message."subject",
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
            ${dataSourceMetadata.schema}."message" message 
        LEFT JOIN
            ${dataSourceMetadata.schema}."messageThread" "messageThread" ON "messageThread".id = message."messageThreadId"
        LEFT JOIN
            (SELECT * FROM ${dataSourceMetadata.schema}."messageParticipant" WHERE "messageParticipant".role = 'from') "messageParticipant" ON "messageParticipant"."messageId" = message.id
        LEFT JOIN
            ${dataSourceMetadata.schema}."person" person ON person."id" = "messageParticipant"."personId"
        LEFT JOIN
            ${dataSourceMetadata.schema}."workspaceMember" "workspaceMember" ON "workspaceMember".id = "messageParticipant"."workspaceMemberId"
        WHERE
            "messageThread".id = ANY($1)
        ORDER BY
            message."receivedAt" DESC
        `,
      [messageThreadIds],
    );

    const totalNumberOfThreads = await workspaceDataSource?.query(
      `
      SELECT COUNT(DISTINCT "messageThread".id)
      FROM
          ${dataSourceMetadata.schema}."message" message 
      LEFT JOIN
          ${dataSourceMetadata.schema}."messageThread" "messageThread" ON "messageThread".id = message."messageThreadId"
      LEFT JOIN
          ${dataSourceMetadata.schema}."messageParticipant" "messageParticipant" ON "messageParticipant"."messageId" = message.id
      LEFT JOIN
          ${dataSourceMetadata.schema}."person" person ON person.id = "messageParticipant"."personId"
      WHERE
          person.id = ANY($1)
      `,
      [personIds],
    );

    const threadParticipantsByThreadId: {
      [key: string]: TimelineThreadParticipant[];
    } = messageThreadIds.reduce((messageThreadIdAcc, messageThreadId) => {
      const threadMessages = threadMessagesFromActiveParticipants?.filter(
        (threadMessage) => threadMessage.id === messageThreadId,
      );

      const threadParticipants = threadMessages?.reduce(
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

      messageThreadIdAcc[messageThreadId] = threadParticipants
        ? Object.values(threadParticipants)
        : [];

      return messageThreadIdAcc;
    }, {});

    const threadVisibility:
      | {
          id: string;
          visibility: 'metadata' | 'subject' | 'share_everything';
        }[]
      | undefined = await workspaceDataSource?.query(
      `
      SELECT
          "messageThread".id,
          "messageChannel".visibility
      FROM
          ${dataSourceMetadata.schema}."messageThread" "messageThread"
      LEFT JOIN
          ${dataSourceMetadata.schema}."message" message ON "message"."messageThreadId" = "messageThread".id
      LEFT JOIN
          ${dataSourceMetadata.schema}."messageChannelMessageAssociation" "messageChannelMessageAssociation" ON "messageChannelMessageAssociation"."messageId" = message.id
      LEFT JOIN
          ${dataSourceMetadata.schema}."messageChannel" "messageChannel" ON "messageChannel".id = "messageChannelMessageAssociation"."messageChannelId"
      WHERE
          "messageThread".id = ANY($1)
      `,
      [messageThreadIds],
    );

    const visibilityValues = ['metadata', 'subject', 'share_everything'];

    const threadVisibilityByThreadId:
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

    const timelineThreads = messageThreadIds.map((messageThreadId) => {
      const threadParticipants = threadParticipantsByThreadId[messageThreadId];

      const firstParticipant = threadParticipants[0];

      const threadParticipantsWithoutFirstParticipant =
        threadParticipants.filter(
          (threadParticipant) =>
            threadParticipant.handle !== firstParticipant.handle,
        );

      const lastTwoParticipants: TimelineThreadParticipant[] = [];

      const lastParticipant =
        threadParticipantsWithoutFirstParticipant.slice(-1)[0];

      if (lastParticipant) {
        lastTwoParticipants.push(lastParticipant);

        const threadParticipantsWithoutFirstAndLastParticipants =
          threadParticipantsWithoutFirstParticipant.filter(
            (threadParticipant) =>
              threadParticipant.handle !== lastParticipant.handle,
          );

        if (threadParticipantsWithoutFirstAndLastParticipants.length > 0)
          lastTwoParticipants.push(
            threadParticipantsWithoutFirstAndLastParticipants.slice(-1)[0],
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
        participantCount: threadParticipants.length,
      };
    });

    return {
      totalNumberOfThreads: totalNumberOfThreads[0]?.count ?? 0,
      timelineThreads,
    };
  }

  async getMessagesFromCompanyId(
    workspaceId: string,
    companyId: string,
    page: number = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotal> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const personIds = await workspaceDataSource?.query(
      `
        SELECT 
            p."id"
        FROM
            ${dataSourceMetadata.schema}."person" p
        WHERE
            p."companyId" = $1
        `,
      [companyId],
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
      workspaceId,
      formattedPersonIds,
      page,
      pageSize,
    );

    return messageThreads;
  }
}
