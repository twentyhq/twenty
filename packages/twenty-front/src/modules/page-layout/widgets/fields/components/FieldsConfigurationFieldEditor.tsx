import { DraggableListItem } from '@/ui/layout/draggable-list/components/DraggableListItem';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfigurationFieldItem } from '@/page-layout/types/FieldsConfiguration';
import { IconEye, IconEyeOff, useIcons } from 'twenty-ui/icon';

type FieldsConfigurationFieldEditorProps = {
  field: FieldsConfigurationFieldItem;
  fieldMetadata: FieldMetadataItem;
  onToggleVisibility: () => void;
};

export const FieldsConfigurationFieldEditor = ({
  field,
  fieldMetadata,
  onToggleVisibility,
}: FieldsConfigurationFieldEditorProps) => {
  const { getIcon } = useIcons();
  const isVisible = field.isVisible ?? true;
  const FieldIcon = getIcon(fieldMetadata.icon);

  return (
    <DraggableListItem
      grip="onHover"
      actionsVisibility="always"
      actions={
        <LightIconButton
          aria-label={isVisible ? t`Hide field` : t`Show field`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleVisibility();
          }}
        >
          {isVisible ? <IconEye /> : <IconEyeOff />}
        </LightIconButton>
      }
      icon={FieldIcon}
      iconContainer
    >
      {fieldMetadata.label}
    </DraggableListItem>
  );
};
