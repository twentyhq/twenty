import { render, waitFor } from '@testing-library/react';

import { PeopleDefault } from '../__stories__/People.stories';

it('Checks the People page render', async () => {
  const { getByTestId } = render(<PeopleDefault />);

  await waitFor(() => {
    const personChip = getByTestId('row-id-0');
    expect(personChip).toBeDefined();
  });
});
