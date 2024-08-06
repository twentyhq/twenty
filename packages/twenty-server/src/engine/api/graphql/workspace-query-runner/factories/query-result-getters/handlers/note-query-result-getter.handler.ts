import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';

type NoteBlock = Record<string, any>;

type NoteBody = NoteBlock[];

export class NoteQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(
    note: NoteWorkspaceEntity,
    workspaceId: string,
  ): Promise<NoteWorkspaceEntity> {
    if (!note.id || !note.body) {
      return note;
    }

    const body: NoteBody = JSON.parse(note.body);

    const bodyWithSignedPayload = await Promise.all(
      body.map(async (block: NoteBlock) => {
        if (block.type === 'image') {
          const imageProps = block.props;

          const signedPayload = await this.fileService.encodeFileToken({
            note_block_id: block.id,
            workspace_id: workspaceId,
          });

          return {
            ...block,
            props: {
              ...imageProps,
              url: `${imageProps.url}?token=${signedPayload}`,
            },
          };
        }

        return block;
      }),
    );

    return {
      ...note,
      body: JSON.stringify(bodyWithSignedPayload),
    };
  }
}
