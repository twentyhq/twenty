/* @license Enterprise */

import * as crypto from 'crypto';

import {
  ENTERPRISE_JWT_DEV_PUBLIC_KEYS,
  ENTERPRISE_JWT_PUBLIC_KEY,
} from 'src/engine/core-modules/enterprise/constants/enterprise-public-key.constant';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

type VerifyEnterpriseJwtArgs = {
  token: string;
  nodeEnvironment: NodeEnvironment;
};

export const verifyEnterpriseJwt = <TPayload extends Record<string, unknown>>({
  token,
  nodeEnvironment,
}: VerifyEnterpriseJwtArgs): TPayload | null => {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signatureBuffer = Buffer.from(
      signature.replace(/-/g, '+').replace(/_/g, '/') +
        '='.repeat((4 - (signature.length % 4)) % 4),
      'base64',
    );

    const publicKeys =
      nodeEnvironment === NodeEnvironment.DEVELOPMENT ||
      nodeEnvironment === NodeEnvironment.TEST
        ? [ENTERPRISE_JWT_PUBLIC_KEY, ...ENTERPRISE_JWT_DEV_PUBLIC_KEYS]
        : [ENTERPRISE_JWT_PUBLIC_KEY];

    for (const publicKey of publicKeys) {
      const isValid = crypto.verify(
        'sha256',
        Buffer.from(signingInput),
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        signatureBuffer,
      );

      if (isValid) {
        const payloadStr = Buffer.from(
          encodedPayload.replace(/-/g, '+').replace(/_/g, '/') +
            '='.repeat((4 - (encodedPayload.length % 4)) % 4),
          'base64',
        ).toString('utf-8');

        return JSON.parse(payloadStr) as TPayload;
      }
    }

    return null;
  } catch {
    return null;
  }
};
