import { Args, Query, Field, Resolver, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Column, Entity } from 'typeorm';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';

@Entity({ name: 'timelineMessage', schema: 'core' })
@ObjectType('TimelineMessage')
class TimelineMessage {
  @Field({ nullable: true })
  @Column({ nullable: true })
  read: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  senderName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  senderPictureUrl: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  numberOfEmailsInThread: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  subject: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  body: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  receivedAt: Date;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => [TimelineMessage])
export class TimelineMessagingResolver {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {}

  @Query(() => [TimelineMessage])
  async timelineMessage(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('personId') personId: string,
  ) {
    console.log('timelineMessage', workspaceId, personId);
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

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
        mr."personId" = $1
) AS subquery
WHERE 
    subquery.rn = 1
ORDER BY 
    subquery.last_message_date DESC;
`,
      [personId],
    );

    console.log('messageThreads', messageThreads);

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
}
