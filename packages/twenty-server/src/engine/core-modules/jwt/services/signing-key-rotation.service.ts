/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type SigningKeyRotationResult = {
  rotated: boolean;
  previousId: string | null;
  newId: string | null;
};

@Injectable()
export class SigningKeyRotationService {
  private readonly logger = new Logger(SigningKeyRotationService.name);

  constructor(
    private readonly jwtKeyManagerService: JwtKeyManagerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async rotateIfDue(): Promise<SigningKeyRotationResult> {
    const rotationDays = this.twentyConfigService.get(
      'SIGNING_KEY_ROTATION_DAYS',
    );

    if (!isDefined(rotationDays)) {
      this.logger.log(
        'SIGNING_KEY_ROTATION_DAYS is not configured, skipping signing key rotation',
      );

      return { rotated: false, previousId: null, newId: null };
    }

    const signingKeys = await this.jwtKeyManagerService.listSigningKeys();
    const current = signingKeys.find(
      (signingKey) => signingKey.isCurrent && !isDefined(signingKey.revokedAt),
    );

    if (!isDefined(current)) {
      return { rotated: false, previousId: null, newId: null };
    }

    const ageDays = (Date.now() - current.createdAt.getTime()) / ONE_DAY_MS;

    if (ageDays < rotationDays) {
      this.logger.log(
        `Current signing key ${current.id} is ${ageDays.toFixed(
          2,
        )} days old, rotation threshold is ${rotationDays} days, skipping`,
      );

      return { rotated: false, previousId: current.id, newId: null };
    }

    const next = await this.jwtKeyManagerService.rotateCurrent();

    return { rotated: true, previousId: current.id, newId: next.id };
  }
}
