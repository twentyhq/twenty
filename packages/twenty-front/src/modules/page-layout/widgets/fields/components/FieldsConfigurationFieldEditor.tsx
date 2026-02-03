import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfigurationFieldItem } from '@/page-layout/types/FieldsConfiguration';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
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
  index,
  onToggleVisibility,
}: FieldsConfigurationFieldEditorProps) => {
  const { getIcon } = useIcons();
  const isVisible = field.isVisible !== false;
  const FieldIcon = getIcon(fieldMetadata.icon);

  const fieldContent = (
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

  return (
    <DraggableItem
      draggableId={field.fieldMetadataId}
      index={index}
      itemComponent={fieldContent}
    />
  );
};
