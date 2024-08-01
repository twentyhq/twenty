import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const query = request.query;

    if (query && query['token']) {
      const payloadToDecode = query['token'];
      const decodedPayload = await this.tokenService.decodePayload(
        payloadToDecode,
        {
          secret: this.environmentService.get('FILE_TOKEN_SECRET'),
        },
      );

      const expirationDate = decodedPayload?.['expiration_date'];
      const workspaceId = decodedPayload?.['workspace_id'];

      const isExpired = await this.isExpired(expirationDate);

      if (isExpired) {
        return false;
      }

      request.workspaceId = workspaceId;
    }

    return true;
  }

  private async isExpired(expirationDate: string): Promise<boolean> {
    if (!expirationDate) {
      return true;
    }

    if (new Date(expirationDate) < new Date()) {
      throw new HttpException(
        'This url has expired. Please reload twenty page and open file again.',
        HttpStatus.FORBIDDEN,
      );
    }

    return false;
  }
}
