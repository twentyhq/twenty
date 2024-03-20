import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';

@Injectable()
export class QueryResultGettersFactory {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
  ) {}

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

    const fileTokenExpiresIn = this.environmentService.get(
      'FILE_TOKEN_EXPIRES_IN',
    );
    const secret = this.environmentService.get('FILE_TOKEN_SECRET');

    const mappedEdges = await Promise.all(
      attachments.edges.map(async (attachment: any) => {
        if (!attachment.node.id || !attachment?.node?.fullPath) {
          return attachment;
        }

        const expirationDate = addMilliseconds(
          new Date(),
          ms(fileTokenExpiresIn),
        );

        const signedPayload = await this.tokenService.encodePayload(
          {
            expiration_date: expirationDate,
            attachment_id: attachment.node.id,
          },
          {
            secret,
          },
        );

        attachment.node.fullPath = `${attachment.node.fullPath}?token=${signedPayload}`;

        return attachment;
      }),
    );

    return {
      ...attachments,
      edges: mappedEdges,
    } as Result;
  }
}
