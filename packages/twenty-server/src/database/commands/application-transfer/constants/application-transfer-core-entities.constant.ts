import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// Application-owned core rows that are not syncable metadata entities
export const APPLICATION_TRANSFER_CORE_ENTITIES = [
  FileEntity,
  KeyValuePairEntity,
  ApplicationAuthorizationEntity,
  PublicDomainEntity,
  ConnectedAccountEntity,
] as const;
