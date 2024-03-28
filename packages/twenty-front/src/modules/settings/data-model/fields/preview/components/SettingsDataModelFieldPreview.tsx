import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { BooleanFieldInput } from '@/object-record/record-field/meta-types/input/components/BooleanFieldInput';
import { RatingFieldInput } from '@/object-record/record-field/meta-types/input/components/RatingFieldInput';
import { SettingsObjectFieldSelectFormValues } from '@/settings/data-model/components/SettingsObjectFieldSelectForm';
import { SettingsDataModelSetFieldValueEffect } from '@/settings/data-model/fields/preview/components/SettingsDataModelSetFieldValueEffect';
import { SettingsDataModelSetRecordEffect } from '@/settings/data-model/fields/preview/components/SettingsDataModelSetRecordEffect';
import { useFieldPreview } from '@/settings/data-model/fields/preview/hooks/useFieldPreview';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export type SettingsDataModelFieldPreviewProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'icon' | 'label' | 'type'> & {
    id?: string;
    name?: string;
  };
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataItem?: ObjectMetadataItem;
  selectOptions?: SettingsObjectFieldSelectFormValues;
  shrink?: boolean;
  withFieldLabel?: boolean;
};

const StyledFieldPreview = styled.div<{ shrink?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(8)};
  overflow: hidden;
  padding: 0
    ${({ shrink, theme }) => (shrink ? theme.spacing(1) : theme.spacing(2))};
  white-space: nowrap;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledFieldLabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsDataModelFieldPreview = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataItem,
  selectOptions,
  shrink,
  withFieldLabel = true,
}: SettingsDataModelFieldPreviewProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();
  const FieldIcon = getIcon(fieldMetadataItem.icon);

  const { entityId, fieldName, fieldPreviewValue, isLabelIdentifier, record } =
    useFieldPreview({
      fieldMetadataItem,
      objectMetadataItem,
      relationObjectMetadataItem,
      selectOptions,
    });

  return (
    <>
      {record ? (
        <SettingsDataModelSetRecordEffect record={record} />
      ) : (
        <SettingsDataModelSetFieldValueEffect
          entityId={entityId}
          fieldName={fieldName}
          value={fieldPreviewValue}
        />
      )}
      <StyledFieldPreview shrink={shrink}>
        {!!withFieldLabel && (
          <StyledFieldLabel>
            <FieldIcon
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
            {fieldMetadataItem.label}:
          </StyledFieldLabel>
        )}
        <FieldContext.Provider
          value={{
            entityId,
            isLabelIdentifier,
            fieldDefinition: {
              type: fieldMetadataItem.type,
              iconName: 'FieldIcon',
              fieldMetadataId: fieldMetadataItem.id || '',
              label: fieldMetadataItem.label,
              metadata: {
                fieldName,
                objectMetadataNameSingular: objectMetadataItem.nameSingular,
                relationObjectMetadataNameSingular:
                  relationObjectMetadataItem?.nameSingular,
                options: selectOptions,
              },
            },
            hotkeyScope: 'field-preview',
          }}
        >
          {fieldMetadataItem.type === FieldMetadataType.Boolean ? (
            <BooleanFieldInput readonly />
          ) : fieldMetadataItem.type === FieldMetadataType.Rating ? (
            <RatingFieldInput readonly />
          ) : (
            <FieldDisplay />
          )}
        </FieldContext.Provider>
      </StyledFieldPreview>
    </>
  );
};
