import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';

@Injectable()
export class FileByIdGuard implements CanActivate {
  constructor(private readonly fileUrlService: FileUrlService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const workspaceId = await this.fileUrlService.verifyFileToken({
      fileToken: request.query.token,
      fileId: request.params.id,
      fileFolder: request.params.fileFolder,
    });

    if (!isDefined(workspaceId)) {
      return false;
    }

    request.workspaceId = workspaceId;

    return true;
  }
}
