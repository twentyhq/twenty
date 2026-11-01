import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewMiniCard } from '@/settings/data-model/components/SettingsDataModelPreviewMiniCard';
import { SettingsDataModelFieldPreview } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreview';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';

type SettingsDataModelFieldPreviewWidgetProps = {
  className?: string;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'options' | 'settings'
  >;
  objectNameSingular: string;
  shrink?: boolean;
  withFieldLabel?: boolean;
  pluralizeLabel?: boolean;
  fullWidth?: boolean;
};

export const SettingsDataModelFieldPreviewWidget = ({
  className,
  fieldMetadataItem,
  objectNameSingular,
  shrink,
  withFieldLabel = true,
  pluralizeLabel = false,
}: SettingsDataModelFieldPreviewWidgetProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  return (
    <div className={className}>
      <SettingsDataModelPreviewMiniCard>
        <SettingsDataModelObjectPreview
          objectMetadataItems={[objectMetadataItem]}
          pluralizeLabel={pluralizeLabel}
        />
        <SettingsDataModelFieldPreview
          objectNameSingular={objectNameSingular}
          fieldMetadataItem={{
            label: fieldMetadataItem.label,
            icon: fieldMetadataItem.icon,
            defaultValue: fieldMetadataItem.defaultValue,
            options: fieldMetadataItem.options,
            settings: fieldMetadataItem.settings,
            type: fieldMetadataItem.type,
            name: computeMetadataNameFromLabel(fieldMetadataItem.label),
          }}
          shrink={shrink}
          withFieldLabel={withFieldLabel}
        />
      </SettingsDataModelPreviewMiniCard>
    </div>
  );
};
