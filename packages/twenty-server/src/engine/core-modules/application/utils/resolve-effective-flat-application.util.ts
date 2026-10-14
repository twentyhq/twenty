import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import {
  resolveEffectiveManifestMessage,
  resolveEffectiveManifestMessages,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';

export const resolveEffectiveFlatApplication = ({
  flatApplication,
  i18nContext,
}: {
  flatApplication: FlatApplication;
  i18nContext: EffectiveEntityI18nContext;
}): FlatApplication => ({
  ...resolveEffectiveManifestMessages({
    entity: 'application',
    value: flatApplication,
    i18nContext,
  }),
  name: resolveEffectiveManifestMessage({
    entity: 'application',
    property: 'displayName',
    sourceValue: flatApplication.name,
    i18nContext,
  }),
});
