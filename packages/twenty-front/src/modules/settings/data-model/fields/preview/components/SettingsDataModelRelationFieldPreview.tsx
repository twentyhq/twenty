import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { SettingsDataModelSetFieldValueEffect } from '@/settings/data-model/fields/preview/components/SettingsDataModelSetFieldValueEffect';
import { useFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useFieldPreviewValue';
import { useIcons } from 'twenty-ui/display';
import { v4 } from 'uuid';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsDataModelRelationFieldPreviewProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'settings'
  >;
  relationTargetObjectNameSingular: string;
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

export const SettingsDataModelRelationFieldPreview = ({
  fieldMetadataItem,
  relationTargetObjectNameSingular,
  shrink,
  withFieldLabel = true,
}: SettingsDataModelRelationFieldPreviewProps) => {
  const { objectMetadataItem: relationTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationTargetObjectNameSingular,
    });

  const theme = useTheme();

  const { getIcon } = useIcons();
  const FieldIcon = getIcon(fieldMetadataItem.icon);

  const fieldPreviewValue = useFieldPreviewValue({
    fieldMetadataItem,
    relationObjectNameSingular: relationTargetObjectNameSingular,
  });

  const fieldName = v4();

  const recordId = `${relationTargetObjectNameSingular}-${fieldName}-RELATION-preview`;

  const isRelation = fieldMetadataItem.type === FieldMetadataType.RELATION;
  const metadata = {
    fieldName,
    objectMetadataNameSingular: CoreObjectNameSingular.Company,
    relationObjectMetadataNameSingular: relationTargetObjectNameSingular,
    options: [],
    settings: fieldMetadataItem.settings,
    relationType: fieldMetadataItem.settings?.relationType,
    morphRelations:
      fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION
        ? [
            {
              type: fieldMetadataItem.settings?.relationType,
              sourceFieldMetadata: {
                id: v4(),
                name: fieldName,
              },
              targetFieldMetadata: {
                id: v4(),
                name: 'does-not-matter',
              },
              sourceObjectMetadata: {
                id: v4(),
                namePlural: 'does-not-matter',
                nameSingular: 'does-not-matter',
              },
              targetObjectMetadata: {
                id: v4(),
                namePlural: relationTargetObjectMetadataItem.namePlural,
                nameSingular: relationTargetObjectMetadataItem.nameSingular,
              },
            } satisfies FieldMetadataItemRelation,
          ]
        : [],
    relationFieldMetadataId: isRelation ? '' : v4(),
    relationObjectMetadataId: isRelation ? '' : v4(),
    relationObjectMetadataNamePlural: isRelation
      ? ''
      : relationTargetObjectMetadataItem.namePlural,
  };

  return (
    <>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: 'record-field-component-instance-id',
        }}
      >
        <SettingsDataModelSetFieldValueEffect
          recordId={recordId}
          gqlFieldName={fieldName}
          value={fieldPreviewValue}
        />
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
              isLabelIdentifier: false,
              fieldDefinition: {
                type: fieldMetadataItem.type,
                iconName: 'FieldIcon',
                fieldMetadataId: '',
                label: fieldMetadataItem.label,
                metadata,
                defaultValue: null,
              },
              isRecordFieldReadOnly: true,
              disableChipClick: true,
            }}
          >
            <FieldDisplay />
          </FieldContext.Provider>
        </StyledFieldPreview>
      </RecordFieldComponentInstanceContext.Provider>
    </>
  );
};
