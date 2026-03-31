import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type API_KEY_ENTITY_NON_CACHED_PROPERTIES } from 'src/engine/core-modules/api-key/constants/api-key-entity-non-cached-properties.constant';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';

type ApiKeyEntityNonCachedProperties =
  (typeof API_KEY_ENTITY_NON_CACHED_PROPERTIES)[number];

type ApiKeyCachedFields = Omit<ApiKeyEntity, ApiKeyEntityNonCachedProperties>;

export type FlatApiKey = Omit<
  ApiKeyCachedFields,
  keyof CastRecordTypeOrmDatePropertiesToString<ApiKeyCachedFields>
> &
  CastRecordTypeOrmDatePropertiesToString<ApiKeyCachedFields>;
