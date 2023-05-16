import { fireEvent, render, waitFor } from '@testing-library/react';

import { EditableRelationStory } from '../__stories__/EditableRelation.stories';
import { CompanyChipPropsType } from '../../chip/CompanyChip';
import { PartialCompany } from '../../../interfaces/company.interface';

import { EditableRelationProps } from '../EditableRelation';
import { act } from 'react-dom/test-utils';

it('Checks the EditableRelation editing event bubbles up', async () => {
  const func = jest.fn(() => null);
  const { getByTestId, getByText } = render(
    <EditableRelationStory
      {...(EditableRelationStory.args as EditableRelationProps<
        PartialCompany,
        CompanyChipPropsType
      >)}
      changeHandler={func}
    />,
  );

  const parent = getByTestId('content-editable-parent');

  const wrapper = parent.querySelector('div');

  await waitFor(() => {
    expect(getByText('Heroku')).toBeInTheDocument();
  });

  if (!wrapper) {
    throw new Error('Editable relation not found');
  }
  fireEvent.click(wrapper);

  const input = parent.querySelector('input');
  if (!input) {
    throw new Error('Search input not found');
  }
  act(() => {
    fireEvent.change(input, { target: { value: 'Ai' } });
  });

  await waitFor(() => {
    expect(getByText('Airbnb')).toBeInTheDocument();
  });

  act(() => {
    fireEvent.click(getByText('Airbnb'));
  });

  await waitFor(() => {
    expect(func).toBeCalledWith({
      domain_name: 'abnb.com',
      id: 'abnb',
      name: 'Airbnb',
    });
  });
});
