import { isNull, isObject, isUndefined } from '@sniptt/guards';

import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';

import { FieldRelationValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldRelationValue = <
  T extends EntityForSelect | EntityForSelect[],
>(
  fieldValue: unknown,
): fieldValue is FieldRelationValue<T> =>
  !isUndefined(fieldValue) && (isObject(fieldValue) || isNull(fieldValue));
