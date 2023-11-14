import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Select } from '@/ui/input/components/Select';
import { Section } from '@/ui/layout/section/components/Section';

import { dataTypes } from '../constants/dataTypes';
import { MetadataFieldDataType } from '../types/ObjectFieldDataType';

import {
  SettingsObjectFieldPreview,
  SettingsObjectFieldPreviewProps,
} from './SettingsObjectFieldPreview';
import { SettingsObjectFieldTypeCard } from './SettingsObjectFieldTypeCard';

type SettingsObjectFieldTypeSelectSectionProps = {
  disabled?: boolean;
  onChange?: (value: MetadataFieldDataType) => void;
} & Pick<
  SettingsObjectFieldPreviewProps,
  | 'fieldIconKey'
  | 'fieldLabel'
  | 'fieldName'
  | 'fieldType'
  | 'isObjectCustom'
  | 'objectIconKey'
  | 'objectLabelPlural'
  | 'objectNamePlural'
>;

const StyledSettingsObjectFieldTypeCard = styled(SettingsObjectFieldTypeCard)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

// TODO: remove "relation" type for now, add it back when the backend is ready.
const { RELATION: _, ...dataTypesWithoutRelation } = dataTypes;

export const SettingsObjectFieldTypeSelectSection = ({
  disabled,
  fieldIconKey,
  fieldLabel,
  fieldName,
  fieldType,
  isObjectCustom,
  objectIconKey,
  objectLabelPlural,
  objectNamePlural,
  onChange,
}: SettingsObjectFieldTypeSelectSectionProps) => (
  <Section>
    <H2Title
      title="Type and values"
      description="The field's type and values."
    />
    <Select
      disabled={disabled}
      dropdownScopeId="object-field-type-select"
      value={fieldType}
      onChange={onChange}
      options={Object.entries(dataTypesWithoutRelation).map(
        ([key, dataType]) => ({
          value: key as MetadataFieldDataType,
          ...dataType,
        }),
      )}
    />
    {['BOOLEAN', 'DATE', 'MONEY', 'NUMBER', 'TEXT', 'URL'].includes(
      fieldType,
    ) && (
      <StyledSettingsObjectFieldTypeCard
        preview={
          <SettingsObjectFieldPreview
            fieldIconKey={fieldIconKey}
            fieldLabel={fieldLabel}
            fieldName={fieldName}
            fieldType={fieldType}
            isObjectCustom={isObjectCustom}
            objectIconKey={objectIconKey}
            objectLabelPlural={objectLabelPlural}
            objectNamePlural={objectNamePlural}
          />
        }
      />
    )}
  </Section>
);
