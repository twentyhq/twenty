import { buildSignedPath } from 'twenty-shared/utils';

import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { extractFilenameFromPath } from 'src/engine/core-modules/file/utils/extract-filename-from-path.utils';

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

    const signedPayload = this.fileService.encodeFileToken({
      filename: extractFilenameFromPath(attachment.fullPath),
      workspaceId: workspaceId,
    });

    const signedPath = buildSignedPath({
      path: attachment.fullPath,
      token: signedPayload,
    });

    const fullPath = `${process.env.SERVER_URL}/files/${signedPath}`;

    return {
      ...attachment,
      fullPath,
    };
  }
}
