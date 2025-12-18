import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { addMilliseconds } from 'date-fns';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import ms from 'ms';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  ApplicationTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

@Injectable()
export class ApplicationTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async generateApplicationToken({
    workspaceId,
    applicationId,
    expiresInSeconds,
  }: Omit<ApplicationTokenJwtPayload, 'type' | 'sub'> & {
    expiresInSeconds: number;
  }): Promise<AuthToken> {
    const expiresIn = `${expiresInSeconds}s`;

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, workspaceId },
    });

    assertIsDefinedOrThrow(
      application,
      new ApplicationException(
        'Application not found',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      ),
    );

    const jwtPayload: ApplicationTokenJwtPayload = {
      sub: applicationId,
      applicationId,
      workspaceId,
      type: JwtTokenTypeEnum.APPLICATION,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          JwtTokenTypeEnum.APPLICATION,
          workspaceId,
        ),
        expiresIn,
      }),
      expiresAt,
    };
  }
}
