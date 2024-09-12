import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const query = request.query;

    if (query && query['token']) {
      const payloadToDecode = query['token'];
      const decodedPayload = await this.jwtWrapperService.decode(
        payloadToDecode,
        {
          secret: this.environmentService.get('FILE_TOKEN_SECRET'),
        } as any,
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
