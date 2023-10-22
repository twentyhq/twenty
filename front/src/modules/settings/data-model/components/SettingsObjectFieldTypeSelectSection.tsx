import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Select } from '@/ui/input/components/Select';
import { Section } from '@/ui/layout/section/components/Section';

import { dataTypes } from '../constants/dataTypes';
import { ObjectFieldDataType } from '../types/ObjectFieldDataType';

type SettingsObjectFieldTypeSelectSectionProps = {
  type: ObjectFieldDataType;
  onChange: (value: ObjectFieldDataType) => void;
};

export const SettingsObjectFieldTypeSelectSection = ({
  type,
  onChange,
}: SettingsObjectFieldTypeSelectSectionProps) => (
  <Section>
    <H2Title
      title="Type and values"
      description="The field's type and values."
    />
    <Select
      dropdownScopeId="object-field-type-select"
      value={type}
      onChange={onChange}
      options={Object.entries(dataTypes).map(([key, dataType]) => ({
        value: key as ObjectFieldDataType,
        ...dataType,
      }))}
    />
  </Section>
);
