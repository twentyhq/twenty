import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { BooleanFieldInput } from '@/object-record/record-field/meta-types/input/components/BooleanFieldInput';
import { RatingFieldInput } from '@/object-record/record-field/meta-types/input/components/RatingFieldInput';
import { SettingsDataModelSetFieldValueEffect } from '@/settings/data-model/fields/preview/components/SettingsDataModelSetFieldValueEffect';
import { SettingsDataModelSetPreviewRecordEffect } from '@/settings/data-model/fields/preview/components/SettingsDataModelSetRecordEffect';
import { useFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useFieldPreviewValue';
import { usePreviewRecord } from '@/settings/data-model/fields/preview/hooks/usePreviewRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export type SettingsDataModelFieldPreviewProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'options' | 'settings'
  > & {
    id?: string;
    name?: string;
  };
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataItem?: ObjectMetadataItem;
  shrink?: boolean;
  withFieldLabel?: boolean;
};

const StyledFieldPreview = styled.div<{ shrink?: boolean }>`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: fit-content;
  line-height: 24px;
  overflow: hidden;
  padding: 0
    ${({ shrink, theme }) => (shrink ? theme.spacing(1) : theme.spacing(2))};
  white-space: nowrap;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
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
  shrink,
  withFieldLabel = true,
}: SettingsDataModelFieldPreviewProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();
  const FieldIcon = getIcon(fieldMetadataItem.icon);

  // id and name are undefined in create mode (field does not exist yet)
  // and defined in edit mode.
  const isLabelIdentifier =
    !!fieldMetadataItem.id &&
    !!fieldMetadataItem.name &&
    isLabelIdentifierField({
      fieldMetadataItem: {
        id: fieldMetadataItem.id,
        name: fieldMetadataItem.name,
      },
      objectMetadataItem,
    });

  const previewRecord = usePreviewRecord({
    objectMetadataItem,
    skip: !isLabelIdentifier,
  });

  const fieldPreviewValue = useFieldPreviewValue({
    fieldMetadataItem,
    relationObjectMetadataItem,
    skip: isLabelIdentifier,
  });

  const fieldName =
    fieldMetadataItem.name || `${fieldMetadataItem.type}-new-field`;
  const recordId =
    previewRecord?.id ??
    `${objectMetadataItem.nameSingular}-${fieldName}-preview`;

  return (
    <>
      {previewRecord ? (
        <SettingsDataModelSetPreviewRecordEffect
          fieldName={fieldName}
          record={previewRecord}
        />
      ) : (
        <SettingsDataModelSetFieldValueEffect
          recordId={recordId}
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
            recordId,
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
                options: fieldMetadataItem.options ?? [],
                settings: fieldMetadataItem.settings,
              },
              defaultValue: fieldMetadataItem.defaultValue,
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
