import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { hasConditionalDisplayRule } from '@/conditional-display/utils/hasConditionalDisplayRule';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfigurationFieldItem } from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationFieldVisibilityDropdown } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldVisibilityDropdown';
import { useIcons } from 'twenty-ui/icon';

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
        <FieldsConfigurationFieldVisibilityDropdown
          fieldMetadataItem={fieldMetadata}
          isVisible={isVisible}
          hasConditionalDisplay={hasConditionalDisplayRule(
            field.conditionalDisplay,
          )}
          onToggleVisibility={onToggleVisibility}
        />
      }
    >
      {fieldMetadata.label}
    </DraggableListRow>
  );
};
