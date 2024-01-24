import { Injectable } from '@nestjs/common';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';

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
  ) {
    const offset = (page - 1) * 10;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const messageThreads = await workspaceDataSource?.query(
      `
      SELECT *
      FROM
      (SELECT "messageThread".id,
      MAX(message."receivedAt") AS "lastMessageReceivedAt",
      COUNT(message.id) AS "numberOfMessagesInThread",
      message.id AS "lastMessageId",
      message.body AS "lastMessageBody",
      message.subject AS "lastMessageSubject",
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
      LIMIT 10
      OFFSET $2
      ) AS "messageThreads"
      WHERE
      "rowNumber" = 1
        `,
      [personIds, offset],
    );

    console.log(messageThreads);

    const messageThreadIds = messageThreads.map(
      (messageThread) => messageThread.id,
    );

    const threadMessagesFromActiveParticipants =
      await workspaceDataSource?.query(
        `
      SELECT "messageThread".id,
        message.id AS "messageId",
        message."receivedAt",
        message.body,
        message."subject",
        "messageParticipant".id AS "messageParticipantId",
        "messageParticipant".handle
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

    const threadParticipantsByThreadId = messageThreadIds.reduce(
      (messageThreadIdAcc, messageThreadId) => {
        const threadMessages = threadMessagesFromActiveParticipants.filter(
          (threadMessage) => threadMessage.id === messageThreadId,
        );

        const threadParticipants = threadMessages.reduce(
          (threadMessageAcc, threadMessage) => {
            const threadParticipant = threadMessageAcc[threadMessage.handle];

            if (!threadParticipant) {
              threadMessageAcc[threadMessage.handle] = {
                id: threadMessage.personId,
                handle: threadMessage.handle,
              };
            }

            return threadMessageAcc;
          },
          {},
        );

        messageThreadIdAcc[messageThreadId] = Object.values(threadParticipants);

        return messageThreadIdAcc;
      },
      {},
    );

    const timelineThreads = messageThreadIds.map((messageThreadId) => {
      const threadParticipants = threadParticipantsByThreadId[messageThreadId];

      const lastMessage = threadMessagesFromActiveParticipants.slice(-1)[0];

      return {
        id: messageThreadId,
        read: true,
        firtstParticipant: threadParticipants[0],
        lastTwoParticipants: threadParticipants.slice(-2),
        lastMessageReceivedAt: lastMessage.receivedAt,
        lastMessageBody: lastMessage.body,
        lastMessageSubject: lastMessage.subject,
        numberOfMessagesInThread: threadMessagesFromActiveParticipants.length,
        participantCount: threadParticipants.length,
      };
    });

    return timelineThreads;
  }

  async getMessagesFromCompanyId(workspaceId: string, companyId: string) {
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
      return [];
    }

    const formattedPersonIds = personIds.map((personId) => personId.id);

    const messageThreads = await this.getMessagesFromPersonIds(
      workspaceId,
      formattedPersonIds,
    );

    return messageThreads;
  }
}
