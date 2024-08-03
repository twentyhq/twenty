import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';

export class AttachmentQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(attachment: any, workspaceId: string): Promise<any> {
    if (!attachment.id || !attachment?.fullPath) {
      return attachment;
    }

    const signedPayload = await this.fileService.encodeFileToken({
      attachment_id: attachment.id,
      workspace_id: workspaceId,
    });

    return {
      ...attachment,
      fullPath: `${attachment.fullPath}?token=${signedPayload}`,
    };
  }
}
