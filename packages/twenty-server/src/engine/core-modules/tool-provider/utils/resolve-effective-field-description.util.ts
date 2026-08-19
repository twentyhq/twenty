import { type APP_LOCALES } from 'twenty-shared/translations';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { type MessageIdTranslator } from 'src/engine/metadata-modules/utils/message-id-translator.type';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

export const resolveEffectiveFieldDescription = ({
  flatFieldMetadata,
  locale,
  i18nInstance,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: MessageIdTranslator;
}): string =>
  resolveEffectiveEntityProperty({
    metadataName: 'fieldMetadata',
    baseValue: flatFieldMetadata.description,
    overrides: flatFieldMetadata.overrides ?? undefined,
    property: 'description',
    i18nContext: {
      locale,
      i18nInstance,
      isStandardApp: belongsToTwentyStandardApp(flatFieldMetadata),
    },
  });
