import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfigurationFieldItem } from '@/page-layout/types/FieldsConfiguration';
import { IconEye, IconEyeOff, useIcons } from 'twenty-ui/icon';
import { MenuItemDraggable } from 'twenty-ui/primitives/navigation';

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
    <MenuItemDraggable
      LeftIcon={FieldIcon}
      text={fieldMetadata.label}
      gripMode="onHover"
      withIconContainer
      isIconDisplayedOnHoverOnly={false}
      iconButtons={
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
    />
  );
};
