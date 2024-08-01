import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { QueryResultGuetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

export class AttachmentQueryResultGetterHandler
  implements QueryResultGuetterHandlerInterface
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async process(attachment: any, workspaceId: string): Promise<any> {
    if (!attachment.id || !attachment?.fullPath) {
      return attachment;
    }

    const fileTokenExpiresIn = this.environmentService.get(
      'FILE_TOKEN_EXPIRES_IN',
    );
    const secret = this.environmentService.get('FILE_TOKEN_SECRET');

    const expirationDate = addMilliseconds(new Date(), ms(fileTokenExpiresIn));

    const signedPayload = await this.tokenService.encodePayload(
      {
        expiration_date: expirationDate,
        attachment_id: attachment.id,
        workspace_id: workspaceId,
      },
      {
        secret,
      },
    );

    return {
      ...attachment,
      fullPath: `${attachment.fullPath}?token=${signedPayload}`,
    };
  }
}
