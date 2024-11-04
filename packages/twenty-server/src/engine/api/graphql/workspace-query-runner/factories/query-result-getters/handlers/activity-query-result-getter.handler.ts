import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

type RichTextBlock = Record<string, any>;

type RichTextBody = RichTextBlock[];

export class ActivityQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(
    activity: TaskWorkspaceEntity | NoteWorkspaceEntity,
    workspaceId: string,
  ): Promise<TaskWorkspaceEntity | NoteWorkspaceEntity> {
    if (!activity.id || !activity.body) {
      return activity;
    }

    const body: RichTextBody = JSON.parse(activity.body);

    const bodyWithSignedPayload = await Promise.all(
      body.map(async (block: RichTextBlock) => {
        if (block.type !== 'image' || !block.props.url) {
          return block;
        }

        const imageProps = block.props;
        const imageUrl = new URL(imageProps.url);

        imageUrl.searchParams.delete('token');

        const signedPayload = await this.fileService.encodeFileToken({
          noteBlockId: block.id,
          workspaceId: workspaceId,
        });

        return {
          ...block,
          props: {
            ...imageProps,
            url: `${imageUrl.toString()}?token=${signedPayload}`,
          },
        };
      }),
    );

    return {
      ...activity,
      body: JSON.stringify(bodyWithSignedPayload),
    };
  }
}
