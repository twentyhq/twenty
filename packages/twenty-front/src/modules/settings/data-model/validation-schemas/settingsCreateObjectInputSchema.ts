import { settingsDataModelObjectAboutFormSchema } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { CreateObjectInput } from '~/generated-metadata/graphql';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

export const settingsCreateObjectInputSchema =
  settingsDataModelObjectAboutFormSchema.transform<CreateObjectInput>(
    (values) => ({
      ...values,
      nameSingular:
        values.nameSingular ??
        computeMetadataNameFromLabel(values.labelSingular),
      namePlural:
        values.namePlural ?? computeMetadataNameFromLabel(values.labelPlural),
      isLabelSyncedWithName: values.isLabelSyncedWithName ?? true,
    }),
  );
