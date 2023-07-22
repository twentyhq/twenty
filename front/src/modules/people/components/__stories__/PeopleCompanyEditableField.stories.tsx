import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';

import { mockedPeopleData } from '~/testing/mock-data/people';

import { PeopleCompanyEditableField } from '../../editable-field/components/PeopleCompanyEditableField';

const meta: Meta<typeof PeopleCompanyEditableField> = {
  title: 'Modules/People/EditableFields/PeopleCompanyEditableField',
  component: PeopleCompanyEditableField,
};

export default meta;
type Story = StoryObj<typeof PeopleCompanyEditableField>;

export const Default: Story = {
  render: () => (
    <BrowserRouter>
      <PeopleCompanyEditableField people={mockedPeopleData[0]} />
    </BrowserRouter>
  ),
};
