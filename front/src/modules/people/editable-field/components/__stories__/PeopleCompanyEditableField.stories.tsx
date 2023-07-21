import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';

import { mockedPeopleData } from '~/testing/mock-data/people';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { PeopleCompanyEditableField } from '../PeopleCompanyEditableField';

const meta: Meta<typeof PeopleCompanyEditableField> = {
  title: 'Modules/People/EditableFields/PeopleCompanyEditableField',
  component: PeopleCompanyEditableField,
};

export default meta;
type Story = StoryObj<typeof PeopleCompanyEditableField>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <BrowserRouter>
      <PeopleCompanyEditableField people={mockedPeopleData[0]} />
    </BrowserRouter>,
  ),
};
