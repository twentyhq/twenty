import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type FieldsConfigurationFieldItem,
  type FieldsConfigurationSection,
} from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconDotsVertical } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

const StyledFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type FieldsConfigurationSectionEditorProps = {
  section: FieldsConfigurationSection;
  index: number;
  objectMetadataItem: ObjectMetadataItem;
  onSectionChange: (section: FieldsConfigurationSection) => void;
};

export const FieldsConfigurationSectionEditor = ({
  section,
  objectMetadataItem,
  onSectionChange,
}: FieldsConfigurationSectionEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldChange = (
    fieldMetadataId: string,
    updatedField: FieldsConfigurationFieldItem,
  ) => {
    const updatedFields = section.fields.map((field) =>
      field.fieldMetadataId === fieldMetadataId ? updatedField : field,
    );

    onSectionChange({
      ...section,
      fields: updatedFields,
    });
  };

  const handleToggleFieldVisibility = (fieldMetadataId: string) => {
    const field = section.fields.find(
      (f) => f.fieldMetadataId === fieldMetadataId,
    );

    if (!field) {
      return;
    }

    const currentlyVisible = field.isVisible !== false;

    const updatedField: FieldsConfigurationFieldItem = {
      ...field,
      isVisible: !currentlyVisible,
    };

    handleFieldChange(fieldMetadataId, updatedField);
  };

  const sortedFields = [...section.fields].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <>
      <MenuItem
        text={section.title}
        iconButtons={[
          {
            Icon: IconDotsVertical,
            onClick: (e) => {
              e.stopPropagation();
              // TODO: Add section menu
            },
          },
        ]}
        onClick={() => setIsExpanded(!isExpanded)}
        hasSubMenu
        isSubMenuOpened={isExpanded}
      />
      {isExpanded && (
        <StyledFieldsContainer>
          {sortedFields.map((field, fieldIndex) => {
            const fieldMetadata = objectMetadataItem.fields.find(
              (f) => f.id === field.fieldMetadataId,
            );

            if (!fieldMetadata) {
              return null;
            }

            return (
              <FieldsConfigurationFieldEditor
                key={field.fieldMetadataId}
                field={field}
                fieldMetadata={fieldMetadata}
                index={fieldIndex}
                onToggleVisibility={() =>
                  handleToggleFieldVisibility(field.fieldMetadataId)
                }
              />
            );
          })}
        </StyledFieldsContainer>
      )}
    </>
  );
};
