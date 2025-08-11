import { Injectable } from '@nestjs/common';

import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { type NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RichTextBlock = Record<string, any>;

type RichTextBody = RichTextBlock[];

@Injectable()
export class ActivityQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(
    activity: TaskWorkspaceEntity | NoteWorkspaceEntity,
    workspaceId: string,
  ): Promise<TaskWorkspaceEntity | NoteWorkspaceEntity> {
    const blocknoteJson = activity.bodyV2?.blocknote;

    if (!activity.id || !blocknoteJson) {
      return activity;
    }

    let blocknote: RichTextBody = [];

    try {
      blocknote = JSON.parse(blocknoteJson);
    } catch {
      blocknote = [];
      // TODO: Remove this once we have removed the old rich text
      // eslint-disable-next-line no-console
      console.warn(
        `Failed to parse body for activity ${activity.id} in workspace ${workspaceId}, for rich text version 'v2'`,
      );
      // eslint-disable-next-line no-console
      console.warn(blocknoteJson);
    }

    const blocknoteWithSignedPayload = await Promise.all(
      blocknote.map(async (block: RichTextBlock) => {
        if (block.type !== 'image' || !block.props.url) {
          return block;
        }

        const imageProps = block.props;
        const url = new URL(imageProps.url);

        const pathname = url.pathname;

        const isLinkExternal = !pathname.startsWith('/files/attachment/');

        if (isLinkExternal) {
          return block;
        }

        const fileName = pathname.match(
          /files\/attachment\/(?:.+)\/(.+)$/,
        )?.[1];

        const signedPath = this.fileService.signFileUrl({
          url: `attachment/${fileName}`,
          workspaceId,
        });

        return {
          ...block,
          props: {
            ...imageProps,
            url: `${process.env.SERVER_URL}/files/${signedPath}`,
          },
        };
      }),
    );

    return {
      ...activity,
      bodyV2: {
        blocknote: JSON.stringify(blocknoteWithSignedPayload),
        markdown: activity.bodyV2?.markdown ?? null,
      },
    };
  }
}
