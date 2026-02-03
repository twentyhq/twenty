import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfigurationFieldItem } from '@/page-layout/types/FieldsConfiguration';
import { IconEye, IconEyeOff, useIcons } from 'twenty-ui/display';
import { MenuItemDraggable } from 'twenty-ui/navigation';

type FieldsConfigurationFieldEditorProps = {
  field: FieldsConfigurationFieldItem;
  fieldMetadata: FieldMetadataItem;
  index: number;
  onToggleVisibility: () => void;
};

export const FieldsConfigurationFieldEditor = ({
  field,
  fieldMetadata,
  onToggleVisibility,
}: FieldsConfigurationFieldEditorProps) => {
  const { getIcon } = useIcons();
  const isVisible = field.isVisible !== false;
  const FieldIcon = getIcon(fieldMetadata.icon);

  return (
    <MenuItemDraggable
      LeftIcon={FieldIcon}
      text={fieldMetadata.label}
      showGrip
      isIconDisplayedOnHoverOnly={false}
      iconButtons={[
        {
          Icon: isVisible ? IconEye : IconEyeOff,
          onClick: (e) => {
            e.stopPropagation();
            onToggleVisibility();
          },
        },
      ]}
    />
  );
};
