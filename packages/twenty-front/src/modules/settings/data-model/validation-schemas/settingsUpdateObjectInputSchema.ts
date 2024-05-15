import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { UpdateObjectPayload } from '~/generated-metadata/graphql';
import { METADATA_NAME_VALID_STRING_PATTERN } from '~/pages/settings/data-model/utils/constants.utils';
import { formatLabelOrThrows } from '~/pages/settings/data-model/utils/format-label.util';

export const settingsUpdateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    imageIdentifierFieldMetadataId: true,
    isActive: true,
    labelIdentifierFieldMetadataId: true,
    labelPlural: true,
    labelSingular: true,
  })
  .partial()
  .transform<UpdateObjectPayload>((value) => ({
    ...value,
    nameSingular: value.labelSingular
      ? formatLabelOrThrows(
          value.labelSingular,
          METADATA_NAME_VALID_STRING_PATTERN,
        )
      : undefined,
    namePlural: value.labelPlural
      ? formatLabelOrThrows(
          value.labelPlural,
          METADATA_NAME_VALID_STRING_PATTERN,
        )
      : undefined,
  }));
