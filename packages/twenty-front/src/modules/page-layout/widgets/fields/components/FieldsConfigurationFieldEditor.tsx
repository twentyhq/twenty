import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfigurationFieldItem } from '@/page-layout/types/FieldsConfiguration';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconEye, IconEyeOff } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { useLingui } from '@lingui/react/macro';

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
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const isVisible = field.isVisible ?? true;
  const FieldIcon = getIcon(fieldMetadata.icon);

  return (
    <DraggableListRow
      startIcon={
        <ApplicationStackIcon
          Icon={FieldIcon}
          applicationId={fieldMetadata.applicationId}
        />
      }
      dragHandleVisibility="hover"
      hasIconBackground
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
    >
      {fieldMetadata.label}
    </DraggableListRow>
  );
};
