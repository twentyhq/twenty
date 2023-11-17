import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Select } from '@/ui/input/components/Select';
import { Section } from '@/ui/layout/section/components/Section';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { dataTypes } from '../constants/dataTypes';

import {
  SettingsObjectFieldPreview,
  SettingsObjectFieldPreviewProps,
} from './SettingsObjectFieldPreview';
import { SettingsObjectFieldTypeCard } from './SettingsObjectFieldTypeCard';

type SettingsObjectFieldTypeSelectSectionProps = {
  disabled?: boolean;
  onChange?: (value: FieldMetadataType) => void;
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

// TODO: remove "enum" and "relation" types for now, add them back when the backend is ready.
const { ENUM: _ENUM, RELATION: _RELATION, ...allowedDataTypes } = dataTypes;

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
      options={Object.entries(allowedDataTypes).map(([key, dataType]) => ({
        value: key as FieldMetadataType,
        ...dataType,
      }))}
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
