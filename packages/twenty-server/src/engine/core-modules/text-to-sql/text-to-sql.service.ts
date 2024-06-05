import { Injectable } from '@nestjs/common';

import { TextToSQLQueryResult } from 'src/engine/core-modules/text-to-sql/dtos/text-to-sql-query-result.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class TextToSQLService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async query(
    workspaceId: string,
    text: string,
  ): Promise<TextToSQLQueryResult> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    /* const totalNumberOfThreads =
      await this.workspaceDataSourceService.executeRawQuery(
        `
      SELECT COUNT(DISTINCT message."messageThreadId")
      FROM
          ${dataSourceSchema}."message" message 
      LEFT JOIN
          ${dataSourceSchema}."messageParticipant" "messageParticipant" ON "messageParticipant"."messageId" = message.id
      WHERE
          "messageParticipant"."personId" = ANY($1)
      AND EXISTS (
          SELECT 1
          FROM ${dataSourceSchema}."messageChannelMessageAssociation" mcma
          WHERE mcma."messageId" = message.id
      )
      `,
        [text],
        workspaceId,
      ); */

    return { tableJson: '{ "test123": "test123" }' };
  }
}
