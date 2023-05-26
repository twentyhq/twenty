import { fireEvent, render, waitFor } from '@testing-library/react';

import { PeopleDefault } from '../__stories__/People.stories';
import { act } from 'react-dom/test-utils';
import {
  GraphqlMutationPerson,
  GraphqlQueryPerson,
} from '../../../interfaces/entities/person.interface';

jest.mock('../../../apollo', () => {
  const personInterface = jest.requireActual(
    '../../../interfaces/entities/person.interface',
  );
  return {
    apiClient: {
      mutate: (arg: {
        mutation: unknown;
        variables: GraphqlMutationPerson;
      }) => {
        const gqlPerson = arg.variables as unknown as GraphqlQueryPerson;
        return {
          data: { updateOnePerson: personInterface.mapToPerson(gqlPerson) },
        };
      },
    },
  };
});

it('Checks people full name edit is updating data', async () => {
  const { getByText, getByDisplayValue } = render(<PeopleDefault />);

  await waitFor(() => {
    expect(getByText('John Doe')).toBeDefined();
  });

  act(() => {
    fireEvent.click(getByText('John Doe'));
  });

  await waitFor(() => {
    expect(getByDisplayValue('John')).toBeInTheDocument();
  });

  act(() => {
    const nameInput = getByDisplayValue('John');

    if (!nameInput) {
      throw new Error('firstNameInput is null');
    }
    fireEvent.change(nameInput, { target: { value: 'Jo' } });
    expect(nameInput).toHaveValue('Jo');
    fireEvent.click(getByText('All People')); // Click outside
  });

  await waitFor(() => {
    expect(getByText('John Doe')).toBeInTheDocument();
  });
});

it('Checks people email edit is updating data', async () => {
  const { getByText, getByDisplayValue } = render(<PeopleDefault />);

  await waitFor(() => {
    expect(getByText('john@linkedin.com')).toBeDefined();
  });

  act(() => {
    fireEvent.click(getByText('john@linkedin.com'));
  });

  await waitFor(() => {
    expect(getByDisplayValue('john@linkedin.com')).toBeInTheDocument();
  });

  act(() => {
    const emailInput = getByDisplayValue('john@linkedin.com');

    if (!emailInput) {
      throw new Error('emailInput is null');
    }
    fireEvent.change(emailInput, { target: { value: 'john@linkedin.c' } });
    fireEvent.click(getByText('All People')); // Click outside
  });

  await waitFor(() => {
    expect(getByText('john@linkedin.c')).toBeInTheDocument();
  });
});

it('Checks insert data is appending a new line', async () => {
  const { getByText, getByTestId, container } = render(<PeopleDefault />);

  await waitFor(() => {
    expect(getByText('John Doe')).toBeDefined();
  });
  const tableRows = container.querySelectorAll<HTMLElement>('table tbody tr');

  expect(tableRows.length).toBe(4);

  act(() => {
    fireEvent.click(getByTestId('add-button'));
  });

  await waitFor(() => {
    const tableRows = container.querySelectorAll<HTMLElement>('table tbody tr');

    expect(tableRows.length).toBe(5);
  });
});
