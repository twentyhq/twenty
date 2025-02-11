import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

type RichTextBlock = Record<string, any>;

type RichTextBody = RichTextBlock[];

export class ActivityQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(
    private readonly fileService: FileService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async handle(
    activity: TaskWorkspaceEntity | NoteWorkspaceEntity,
    workspaceId: string,
  ): Promise<TaskWorkspaceEntity | NoteWorkspaceEntity> {
    const isRichTextV2Enabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IsRichTextV2Enabled,
      workspaceId,
    );

    const blocknoteJson = isRichTextV2Enabled
      ? activity.bodyV2?.blocknote
      : activity.body;

    if (!activity.id || !blocknoteJson) {
      return activity;
    }

    let blocknote: RichTextBody = [];

    try {
      blocknote = JSON.parse(blocknoteJson);
    } catch (error) {
      blocknote = [];
      // TODO: Remove this once we have removed the old rich text
      // eslint-disable-next-line no-console
      console.warn(
        `Failed to parse body for activity ${activity.id} in workspace ${workspaceId}, for rich text version ${isRichTextV2Enabled ? 'v2' : 'v1'}`,
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

    if (isRichTextV2Enabled) {
      return {
        ...activity,
        bodyV2: {
          blocknote: JSON.stringify(blocknoteWithSignedPayload),
          markdown: activity.bodyV2?.markdown ?? null,
        },
      };
    }

    return {
      ...activity,
      body: JSON.stringify(blocknoteWithSignedPayload),
    };
  }
}
