import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type USER_ENTITY_NON_CACHED_PROPERTIES } from 'src/engine/core-modules/user/constants/user-entity-non-cached-properties.constant';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

type UserEntityNonCachedProperties =
  (typeof USER_ENTITY_NON_CACHED_PROPERTIES)[number];

type UserCachedFields = Omit<UserEntity, UserEntityNonCachedProperties>;

export type FlatUser = Omit<
  UserCachedFields,
  keyof CastRecordTypeOrmDatePropertiesToString<UserCachedFields>
> &
  CastRecordTypeOrmDatePropertiesToString<UserCachedFields>;
