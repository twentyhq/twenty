import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomBytes } from 'crypto';

import { Repository } from 'typeorm';

import {
  decryptText,
  encryptText,
} from 'src/engine/core-modules/auth/auth.util';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type PostgresCredentialsDTO } from 'src/engine/core-modules/postgres-credentials/dtos/postgres-credentials.dto';
import { PostgresCredentialsEntity } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';

export class PostgresCredentialsService {
  constructor(
    @InjectRepository(PostgresCredentialsEntity)
    private readonly postgresCredentialsRepository: Repository<PostgresCredentialsEntity>,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  async enablePostgresProxy(
    workspaceId: string,
  ): Promise<PostgresCredentialsDTO> {
    const user = `user_${randomBytes(4).toString('hex')}`;
    const password = randomBytes(16).toString('hex');

    const key = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.POSTGRES_PROXY,
      workspaceId,
    );
    const passwordHash = encryptText(password, key);

    const existingCredentials =
      await this.postgresCredentialsRepository.findOne({
        where: {
          workspaceId,
        },
      });

    if (existingCredentials) {
      throw new BadRequestException(
        'Postgres credentials already exist for this workspace',
      );
    }

    const postgresCredentials = await this.postgresCredentialsRepository.create(
      {
        user,
        passwordHash,
        workspaceId,
      },
    );

    await this.postgresCredentialsRepository.save(postgresCredentials);

    return {
      id: postgresCredentials.id,
      user,
      password,
      workspaceId,
    };
  }

  async disablePostgresProxy(
    workspaceId: string,
  ): Promise<PostgresCredentialsDTO> {
    const postgresCredentials =
      await this.postgresCredentialsRepository.findOne({
        where: {
          workspaceId,
        },
      });

    if (!postgresCredentials?.id) {
      throw new NotFoundError(
        'No valid Postgres credentials not found for this workspace',
      );
    }

    await this.postgresCredentialsRepository.delete({
      id: postgresCredentials.id,
    });

    const key = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.POSTGRES_PROXY,
      workspaceId,
    );

    return {
      id: postgresCredentials.id,
      user: postgresCredentials.user,
      password: decryptText(postgresCredentials.passwordHash, key),
      workspaceId: postgresCredentials.workspaceId,
    };
  }

  async getPostgresCredentials(
    workspaceId: string,
  ): Promise<PostgresCredentialsDTO | null> {
    const postgresCredentials =
      await this.postgresCredentialsRepository.findOne({
        where: {
          workspaceId,
        },
      });

    if (!postgresCredentials) {
      return null;
    }

    const key = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.POSTGRES_PROXY,
      workspaceId,
    );

    return {
      id: postgresCredentials.id,
      user: postgresCredentials.user,
      password: decryptText(postgresCredentials.passwordHash, key),
      workspaceId: postgresCredentials.workspaceId,
    };
  }
}
