import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfigurationFieldItem } from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationFieldOptionsDropdown } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldOptionsDropdown';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconEye, IconEyeOff } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { ButtonGroup } from 'twenty-ui/primitives/input';

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
        <ButtonGroup attached={false} aria-label={t`Field actions`}>
          <FieldsConfigurationFieldOptionsDropdown
            fieldMetadataItem={fieldMetadata}
            conditionalDisplay={field.conditionalDisplay}
          />
          <LightIconButton
            aria-label={isVisible ? t`Hide field` : t`Show field`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleVisibility();
            }}
          >
            {isVisible ? <IconEye /> : <IconEyeOff />}
          </LightIconButton>
        </ButtonGroup>
      }
    >
      {fieldMetadata.label}
    </DraggableListRow>
  );
};
