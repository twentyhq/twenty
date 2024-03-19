import { Injectable } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine-metadata/field-metadata/interfaces/object-metadata.interface';

import { TokenService } from 'src/engine/modules/auth/services/token.service';

@Injectable()
export class QueryResultGettersFactory {
  constructor(private readonly tokenService: TokenService) {}

  async create<Result>(
    result: Result,
    objectMetadataItem: ObjectMetadataInterface,
  ): Promise<Result> {
    // TODO: look for file type once implemented
    switch (objectMetadataItem.nameSingular) {
      case 'attachment':
        return this.applyAttachmentGetters(result);
      default:
        return result;
    }
  }

  private async applyAttachmentGetters<Result>(
    attachments: any,
  ): Promise<Result> {
    if (!attachments || !attachments.edges) {
      return attachments;
    }

    const mappedEdges = await Promise.all(
      attachments.edges.map(async (attachment: any) => {
        if (attachment?.node?.fullPath) {
          const todayDate = new Date();
          const expirationDate = todayDate.setDate(todayDate.getDate() + 1);

          const signedExpirationDate = await this.tokenService.encodePayload({
            expiration_date: expirationDate,
          });

          attachment.node.fullPath = `${attachment.node.fullPath}?token=${signedExpirationDate}`;
        }

        return attachment;
      }),
    );

    return {
      ...attachments,
      edges: mappedEdges,
    } as Result;
  }
}
