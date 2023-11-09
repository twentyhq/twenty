import { useEffect } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useFindManyObjects } from '@/metadata/hooks/useFindManyObjects';
import { parseFieldType } from '@/metadata/utils/parseFieldType';
import { Tag } from '@/ui/display/tag/components/Tag';
import { useLazyLoadIcon } from '@/ui/input/hooks/useLazyLoadIcon';
import { FieldDisplay } from '@/ui/object/field/components/FieldDisplay';
import { FieldContext } from '@/ui/object/field/contexts/FieldContext';
import { BooleanFieldInput } from '@/ui/object/field/meta-types/input/components/BooleanFieldInput';
import { entityFieldsFamilySelector } from '@/ui/object/field/states/selectors/entityFieldsFamilySelector';
import { FieldMetadataType } from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';

import { dataTypes } from '../constants/dataTypes';
import { MetadataFieldDataType } from '../types/ObjectFieldDataType';

export type SettingsObjectFieldPreviewProps = {
  fieldIconKey?: string | null;
  fieldLabel: string;
  fieldName?: string;
  fieldType: MetadataFieldDataType;
  isObjectCustom: boolean;
  objectIconKey?: string | null;
  objectLabelPlural: string;
  objectNamePlural: string;
};

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  max-width: 480px;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledObjectSummary = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledObjectName = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledFieldPreview = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(8)};
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

const StyledFieldLabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsObjectFieldPreview = ({
  fieldIconKey,
  fieldLabel,
  fieldName,
  fieldType,
  isObjectCustom,
  objectIconKey,
  objectLabelPlural,
  objectNamePlural,
}: SettingsObjectFieldPreviewProps) => {
  const theme = useTheme();
  const { Icon: ObjectIcon } = useLazyLoadIcon(objectIconKey ?? '');
  const { Icon: FieldIcon } = useLazyLoadIcon(fieldIconKey ?? '');

  const { objects } = useFindManyObjects({
    objectNamePlural,
    skip: !fieldName,
  });

  const [fieldValue, setFieldValue] = useRecoilState(
    entityFieldsFamilySelector({
      entityId: objects[0]?.id ?? objectNamePlural,
      fieldName: fieldName || 'new-field',
    }),
  );

  useEffect(() => {
    setFieldValue(
      fieldName && assertNotNull(objects[0]?.[fieldName])
        ? objects[0][fieldName]
        : dataTypes[fieldType].defaultValue,
    );
  }, [fieldName, fieldType, fieldValue, objects, setFieldValue]);

  return (
    <StyledContainer>
      <StyledObjectSummary>
        <StyledObjectName>
          {!!ObjectIcon && (
            <ObjectIcon
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.sm}
            />
          )}
          {objectLabelPlural}
        </StyledObjectName>
        {isObjectCustom ? (
          <Tag color="orange" text="Custom" />
        ) : (
          <Tag color="blue" text="Standard" />
        )}
      </StyledObjectSummary>
      <StyledFieldPreview>
        <StyledFieldLabel>
          {!!FieldIcon && (
            <FieldIcon
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          )}
          {fieldLabel}:
        </StyledFieldLabel>
        <FieldContext.Provider
          value={{
            entityId: objects[0]?.id ?? objectNamePlural,
            fieldDefinition: {
              type: parseFieldType(fieldType as FieldMetadataType),
              Icon: FieldIcon,
              fieldMetadataId: '',
              label: fieldLabel,
              metadata: { fieldName: fieldName || 'new-field' },
            },
            hotkeyScope: 'field-preview',
          }}
        >
          {fieldType === 'BOOLEAN' ? (
            <BooleanFieldInput readonly />
          ) : (
            <FieldDisplay />
          )}
        </FieldContext.Provider>
      </StyledFieldPreview>
    </StyledContainer>
  );
};
