import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
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
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async updateLabPublicFeatureFlag(
    workspaceId: string,
    payload: UpdateLabPublicFeatureFlagInput,
  ): Promise<void> {
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
      relations: ['featureFlags'],
    });

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException('Workspace not found', AuthExceptionCode.INVALID_INPUT),
    );

    const existingFlag = workspace.featureFlags?.find(
      (flag) => flag.key === FeatureFlagKey[payload.publicFeatureFlag],
    );

    if (!existingFlag) {
      throw new FeatureFlagException(
        'Public feature flag not found',
        FeatureFlagExceptionCode.FEATURE_FLAG_NOT_FOUND,
      );
    }

    await this.featureFlagRepository.update(existingFlag.id, {
      value: payload.value,
    });
  }
}
