import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';
import { UpdateLabPublicFeatureFlagInput } from 'src/engine/core-modules/lab/dtos/update-lab-public-feature-flag.input';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async updateLabPublicFeatureFlag(
    workspaceId: string,
    payload: UpdateLabPublicFeatureFlagInput,
  ): Promise<FeatureFlag> {
    featureFlagValidator.assertIsFeatureFlagKey(
      payload.publicFeatureFlag,
      new FeatureFlagException(
        'Invalid feature flag key',
        FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
      ),
    );

    publicFeatureFlagValidator.assertIsPublicFeatureFlag(
      FeatureFlagKey[payload.publicFeatureFlag],
      new FeatureFlagException(
        'Feature flag is not public',
        FeatureFlagExceptionCode.FEATURE_FLAG_IS_NOT_PUBLIC,
      ),
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException('Workspace not found', AuthExceptionCode.INVALID_INPUT),
    );

    const existingFlag = await this.featureFlagRepository.findOne({
      where: {
        workspaceId,
        key: FeatureFlagKey[payload.publicFeatureFlag],
      },
    });

    if (existingFlag) {
      await this.featureFlagRepository.update(existingFlag.id, {
        value: payload.value,
      });

      return { ...existingFlag, value: payload.value };
    }

    return this.featureFlagRepository.save({
      key: FeatureFlagKey[payload.publicFeatureFlag],
      value: payload.value,
      workspaceId,
    });
  }
}
