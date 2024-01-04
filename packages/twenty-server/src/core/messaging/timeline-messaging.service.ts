import { Injectable } from '@nestjs/common';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';

@Injectable()
export class TimelineMessagingService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {}

  async getMessagesFromPersonIds(workspaceId: string, personIds: string[]) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    // 10 first threads This hard limit is just for the POC, we will implement pagination later
    const messageThreads = await workspaceDataSource?.query(
      `
    SELECT 
        subquery.*,
        message_count,
        last_message_subject,
        last_message_body,
        last_message_date,
        last_message_recipient_handle,
        last_message_recipient_displayName
    FROM (
        SELECT 
            mt.*,
            COUNT(m."id") OVER (PARTITION BY mt."id") AS message_count,
            FIRST_VALUE(m."subject") OVER (PARTITION BY mt."id" ORDER BY m."date" DESC) AS last_message_subject,
            FIRST_VALUE(m."body") OVER (PARTITION BY mt."id" ORDER BY m."date" DESC) AS last_message_body,
            FIRST_VALUE(m."date") OVER (PARTITION BY mt."id" ORDER BY m."date" DESC) AS last_message_date,
            FIRST_VALUE(mr."handle") OVER (PARTITION BY mt."id" ORDER BY m."date" DESC) AS last_message_recipient_handle,
            FIRST_VALUE(mr."displayName") OVER (PARTITION BY mt."id" ORDER BY m."date" DESC) AS last_message_recipient_displayName,
            ROW_NUMBER() OVER (PARTITION BY mt."id" ORDER BY m."date" DESC) AS rn
        FROM 
            ${dataSourceMetadata.schema}."messageThread" mt
        LEFT JOIN 
            ${dataSourceMetadata.schema}."message" m ON mt."id" = m."messageThreadId"
        LEFT JOIN 
            ${dataSourceMetadata.schema}."messageRecipient" mr ON m."id" = mr."messageId"
        WHERE 
            mr."personId" IN (SELECT unnest($1::uuid[]))
    ) AS subquery
    WHERE 
        subquery.rn = 1
    ORDER BY 
        subquery.last_message_date DESC
    LIMIT 10;
`,
      [personIds],
    );

    const formattedMessageThreads = messageThreads.map((messageThread) => {
      return {
        read: true,
        senderName: messageThread.last_message_recipient_handle,
        senderPictureUrl: '',
        numberOfMessagesInThread: messageThread.message_count,
        subject: messageThread.last_message_subject,
        body: messageThread.last_message_body,
        receivedAt: messageThread.last_message_date,
      };
    });

    return formattedMessageThreads;
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
