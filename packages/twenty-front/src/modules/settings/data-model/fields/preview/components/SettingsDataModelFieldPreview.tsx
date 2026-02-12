import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { BooleanFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/BooleanFieldInput';
import { RatingFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RatingFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { SettingsDataModelLabelIdentifierPreviewContextWrapper } from '@/settings/data-model/fields/preview/components/SettingsDataModelLabelIdentifierPreviewContextWrapper';
import { SettingsDataModelSetFieldValueEffect } from '@/settings/data-model/fields/preview/components/SettingsDataModelSetFieldValueEffect';
import { SettingsDataModelSetLabelIdentifierRecordEffect } from '@/settings/data-model/fields/preview/components/SettingsDataModelSetLabelIdentifierRecordEffect';
import { useFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useFieldPreviewValue';
import { useIcons } from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsDataModelFieldPreviewProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'icon' | 'label' | 'type' | 'defaultValue' | 'options' | 'settings'
  >;
  objectNameSingular: string;
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
  objectNameSingular,
  shrink,
  withFieldLabel = true,
}: SettingsDataModelFieldPreviewProps) => {
  const theme = useTheme();
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular: objectNameSingular,
    });

  const { getIcon } = useIcons();
  const FieldIcon = getIcon(fieldMetadataItem.icon);

  const isLabelIdentifier =
    labelIdentifierFieldMetadataItem?.name === fieldMetadataItem.name;

  const fieldName = fieldMetadataItem.name;
  const fieldType = fieldMetadataItem.type;

  const recordId = `${objectNameSingular}-${fieldName}-${fieldType}-preview`;

  const fieldPreviewValue = useFieldPreviewValue({
    fieldMetadataItem,
    skip: isLabelIdentifier,
  });

  const metadata = {
    fieldName,
    objectMetadataNameSingular: objectNameSingular,
    options: fieldMetadataItem.options ?? [],
    settings: fieldMetadataItem.settings,
  };

  return (
    <>
      <SettingsDataModelLabelIdentifierPreviewContextWrapper
        objectNameSingular={objectNameSingular}
        labelIdentifierFieldMetadataItem={labelIdentifierFieldMetadataItem}
      >
        <RecordFieldComponentInstanceContext.Provider
          value={{
            instanceId: 'record-field-component-instance-id',
          }}
        >
          {isLabelIdentifier ? (
            <SettingsDataModelSetLabelIdentifierRecordEffect
              objectNameSingular={objectNameSingular}
              recordId={recordId}
            />
          ) : (
            <SettingsDataModelSetFieldValueEffect
              recordId={recordId}
              gqlFieldName={fieldMetadataItem.name ?? ''}
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
                  fieldMetadataId: '',
                  label: fieldMetadataItem.label,
                  metadata,
                  defaultValue: fieldMetadataItem.defaultValue,
                },
                isRecordFieldReadOnly:
                  fieldMetadataItem.type === FieldMetadataType.BOOLEAN ||
                  fieldMetadataItem.type === FieldMetadataType.RATING
                    ? true
                    : false,
                disableChipClick: true,
              }}
            >
              {fieldMetadataItem.type === FieldMetadataType.BOOLEAN ? (
                <BooleanFieldInput />
              ) : fieldMetadataItem.type === FieldMetadataType.RATING ? (
                <RatingFieldInput />
              ) : (
                <FieldDisplay />
              )}
            </FieldContext.Provider>
          </StyledFieldPreview>
        </RecordFieldComponentInstanceContext.Provider>
      </SettingsDataModelLabelIdentifierPreviewContextWrapper>
    </>
  );
};
