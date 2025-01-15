import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

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

    const signedPayload = await this.fileService.encodeFileToken({
      attachmentId: attachment.id,
      workspaceId: workspaceId,
    });

    return {
      ...attachment,
      fullPath: `${process.env.SERVER_URL}/files/${attachment.fullPath}?token=${signedPayload}`,
    };
  }
}
