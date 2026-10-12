import type {
  FieldManifest,
  ObjectFieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v5 } from 'uuid';

const OPTION_ID_NAMESPACE = 'a80ff791-b940-4c47-a522-2bb478515415';

export const addMissingFieldOptionIds = <
  TEntity extends FieldManifest | ObjectFieldManifest,
>(
  fieldManifest: TEntity,
): TEntity => {
  if (
    fieldManifest.type !== FieldMetadataType.SELECT &&
    fieldManifest.type !== FieldMetadataType.MULTI_SELECT
  ) {
    return fieldManifest;
  }

  if (fieldManifest.options === undefined || fieldManifest.options === null) {
    return fieldManifest;
  }

  return {
    ...fieldManifest,
    options: fieldManifest.options.map((option) => ({
      ...option,
      id:
        option.id ??
        v5(
          `${option.label}-${fieldManifest.universalIdentifier}`,
          OPTION_ID_NAMESPACE,
        ),
    })),
  };
};
