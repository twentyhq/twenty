import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { type FileService } from 'src/engine/core-modules/file/services/file.service';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

export class AttachmentQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(
    attachment: AttachmentWorkspaceEntity,
    workspaceId: string,
  ): Promise<AttachmentWorkspaceEntity> {
    if (!attachment.id || !attachment?.fullPath) {
      return attachment;
    }

    const signedPath = this.fileService.signFileUrl({
      url: attachment.fullPath,
      workspaceId,
    });

    const fullPath = `${process.env.SERVER_URL}/files/${signedPath}`;

    return {
      ...attachment,
      fullPath,
    };
  }
}
