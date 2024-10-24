import { settingsDataModelObjectAboutFormSchema } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { CreateObjectInput } from '~/generated-metadata/graphql';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

export const settingsCreateObjectInputSchema =
  settingsDataModelObjectAboutFormSchema.transform<CreateObjectInput>(
    (values) => ({
      ...values,
      nameSingular:
        values.nameSingular ??
        computeMetadataNameFromLabelOrThrow(values.labelSingular),
      namePlural:
        values.namePlural ??
        computeMetadataNameFromLabelOrThrow(values.labelPlural),
      shouldSyncLabelAndName: values.shouldSyncLabelAndName ?? true,
    }),
  );
