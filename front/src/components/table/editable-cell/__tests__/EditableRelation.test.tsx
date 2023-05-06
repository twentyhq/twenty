import { fireEvent, render } from '@testing-library/react';

import { EditableRelationStory } from '../__stories__/EditableRelation.stories';
import CompanyChip, { CompanyChipPropsType } from '../../../chips/CompanyChip';
import { PartialCompany } from '../../../../interfaces/company.interface';

it('Checks the EditableRelation editing event bubbles up', async () => {
  const func = jest.fn(() => null);
  const { getByTestId } = render(
    <EditableRelationStory
      ChipComponent={CompanyChip}
      changeHandler={func}
      relation={{ id: '123', name: 'abnb', domain_name: 'abnb.com' }}
      chipComponentPropsMapper={(
        company: PartialCompany,
      ): CompanyChipPropsType => {
        return {
          name: company.name,
          picture: `https://www.google.com/s2/favicons?domain=${company.domain_name}&sz=256`,
        };
      }}
    />,
  );

  const parent = getByTestId('content-editable-parent');

  const wrapper = parent.querySelector('div');

  if (!wrapper) {
    throw new Error('Editable input not found');
  }
  fireEvent.click(wrapper);
});
