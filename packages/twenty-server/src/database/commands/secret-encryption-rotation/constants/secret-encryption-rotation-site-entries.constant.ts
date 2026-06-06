import { type Type } from '@nestjs/common';

import { ConnectionParametersRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/connection-parameters-rotation.handler';
import { SensitiveConfigStorageRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/sensitive-config-storage-rotation.handler';
import { type SecretEncryptionRotationHandler } from 'src/database/commands/secret-encryption-rotation/interfaces/secret-encryption-rotation-handler.interface';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { type ExtractEncryptedColumns } from 'src/engine/core-modules/secret-encryption/branded-strings/extract-encrypted-columns.type';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

type DedicatedRotationHandlerClass = Type<SecretEncryptionRotationHandler>;

type ColumnRotationSiteMetadata<E extends Type<unknown>> = {
  siteName: string;
  customHandler: DedicatedRotationHandlerClass | undefined;
  isWorkspaceScoped: boolean;
  extraWhere: Readonly<Partial<InstanceType<E>>> | undefined;
};

type SecretEncryptionRotationRegistryShape<R> = {
  [N in keyof R]: R[N] extends { entity: infer E extends Type<unknown> }
    ? {
        entity: E;
        columnSiteNames: {
          [K in ExtractEncryptedColumns<
            InstanceType<E>
          >]: ColumnRotationSiteMetadata<E>;
        };
      }
    : never;
};

const defineRotationRegistry = <
  const R extends SecretEncryptionRotationRegistryShape<R>,
>(
  registry: R,
) => registry;

export const SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES = defineRotationRegistry({
  ApplicationRegistrationVariableEntity: {
    entity: ApplicationRegistrationVariableEntity,
    columnSiteNames: {
      encryptedValue: {
        siteName: 'application-registration-variable',
        customHandler: undefined,
        isWorkspaceScoped: false,
        extraWhere: undefined,
      },
    },
  },
  ApplicationVariableEntity: {
    entity: ApplicationVariableEntity,
    columnSiteNames: {
      value: {
        siteName: 'application-variable',
        customHandler: undefined,
        isWorkspaceScoped: true,
        extraWhere: undefined,
      },
    },
  },
  ConnectedAccountEntity: {
    entity: ConnectedAccountEntity,
    columnSiteNames: {
      accessToken: {
        siteName: 'connected-account-access-token',
        customHandler: undefined,
        isWorkspaceScoped: true,
        extraWhere: undefined,
      },
      refreshToken: {
        siteName: 'connected-account-refresh-token',
        customHandler: undefined,
        isWorkspaceScoped: true,
        extraWhere: undefined,
      },
      connectionParameters: {
        siteName: 'connected-account-connection-parameters',
        customHandler: ConnectionParametersRotationHandler,
        isWorkspaceScoped: false,
        extraWhere: undefined,
      },
    },
  },
  SigningKeyEntity: {
    entity: SigningKeyEntity,
    columnSiteNames: {
      privateKey: {
        siteName: 'signing-key-private-key',
        customHandler: undefined,
        isWorkspaceScoped: false,
        extraWhere: undefined,
      },
    },
  },
  TwoFactorAuthenticationMethodEntity: {
    entity: TwoFactorAuthenticationMethodEntity,
    columnSiteNames: {
      secret: {
        siteName: 'totp-secret',
        customHandler: undefined,
        isWorkspaceScoped: true,
        extraWhere: undefined,
      },
    },
  },
});

// Sites whose encrypted-ness is per-row conditional and lives outside
// the type system (currently `KeyValuePairEntity.value` for sensitive
// CONFIG_VARIABLE rows of type STRING).
export const SECRET_ENCRYPTION_ROTATION_UNTYPED_SITE_ENTRIES = {
  SENSITIVE_CONFIG_STORAGE: {
    siteName: 'sensitive-config-storage',
    handler: SensitiveConfigStorageRotationHandler,
  },
} as const satisfies Record<
  string,
  { siteName: string; handler: DedicatedRotationHandlerClass }
>;

type RegistryColumnMetadataUnion = {
  [N in keyof typeof SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES]: (typeof SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES)[N]['columnSiteNames'][keyof (typeof SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES)[N]['columnSiteNames']];
}[keyof typeof SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES];

type TypedSiteNameUnion = RegistryColumnMetadataUnion['siteName'];

type UntypedSiteNameUnion =
  (typeof SECRET_ENCRYPTION_ROTATION_UNTYPED_SITE_ENTRIES)[keyof typeof SECRET_ENCRYPTION_ROTATION_UNTYPED_SITE_ENTRIES]['siteName'];

export type SecretEncryptionRotationSiteName =
  | TypedSiteNameUnion
  | UntypedSiteNameUnion;
