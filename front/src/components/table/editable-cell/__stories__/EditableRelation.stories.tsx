import EditableRelation, { EditableRelationProps } from '../EditableRelation';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import CompanyChip, { CompanyChipPropsType } from '../../../chips/CompanyChip';
import {
  Company,
  PartialCompany,
} from '../../../../interfaces/company.interface';
import { compact } from '@apollo/client/utilities';
import { ComponentType } from 'react';

const component = {
  title: 'editable-cell/EditableRelation',
  component: EditableRelation,
};

export default component;

const Template: StoryFn<
  typeof EditableRelation<PartialCompany, CompanyChipPropsType>
> = (args: EditableRelationProps<PartialCompany, CompanyChipPropsType>) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <div data-testid="content-editable-parent">
        <EditableRelation<PartialCompany, CompanyChipPropsType> {...args} />
      </div>
    </ThemeProvider>
  );
};

export const EditableRelationStory = Template.bind({});
EditableRelationStory.args = {
  relation: {
    id: '123',
  } as Company,
  ChipComponent: CompanyChip,
  chipComponentPropsMapper: (company: PartialCompany): CompanyChipPropsType => {
    return {
      name: company.name,
      picture: `https://www.google.com/s2/favicons?domain=${company.domain_name}&sz=256`,
    };
  },
  changeHandler: (relation: PartialCompany) => {
    console.log('changed', relation);
  },
};
