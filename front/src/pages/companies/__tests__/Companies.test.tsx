import { fireEvent, render, waitFor } from '@testing-library/react';

import { CompaniesDefault } from '../__stories__/Companies.stories';
import { act } from 'react-dom/test-utils';
import {
  GraphqlMutationCompany,
  GraphqlQueryCompany,
} from '../../../interfaces/company.interface';

jest.mock('../../../apollo', () => {
  const companyInterface = jest.requireActual(
    '../../../interfaces/company.interface',
  );
  return {
    apiClient: {
      mutate: (arg: {
        mutation: unknown;
        variables: GraphqlMutationCompany;
      }) => {
        const gqlCompany = arg.variables as unknown as GraphqlQueryCompany;
        return { data: companyInterface.mapToCompany(gqlCompany) };
      },
    },
  };
});

it('Checks company name edit is updating data', async () => {
  const { getByText, getByDisplayValue } = render(<CompaniesDefault />);

  await waitFor(() => {
    expect(getByText('Airbnb')).toBeDefined();
  });

  act(() => {
    fireEvent.click(getByText('Airbnb'));
  });

  await waitFor(() => {
    expect(getByDisplayValue('Airbnb')).toBeInTheDocument();
  });

  act(() => {
    const nameInput = getByDisplayValue('Airbnb');

    if (!nameInput) {
      throw new Error('nameInput is null');
    }
    fireEvent.change(nameInput, { target: { value: 'Airbnbb' } });
    fireEvent.click(getByText('All Companies')); // Click outside
  });

  await waitFor(() => {
    expect(getByText('Airbnbb')).toBeDefined();
  });
});

it('Checks company url edit is updating data', async () => {
  const { getByText, getByDisplayValue } = render(<CompaniesDefault />);

  await waitFor(() => {
    expect(getByText('airbnb.com')).toBeDefined();
  });

  act(() => {
    fireEvent.click(getByText('airbnb.com'));
  });

  await waitFor(() => {
    expect(getByDisplayValue('airbnb.com')).toBeInTheDocument();
  });

  act(() => {
    const urlInput = getByDisplayValue('airbnb.com');

    if (!urlInput) {
      throw new Error('urlInput is null');
    }
    fireEvent.change(urlInput, { target: { value: 'airbnb.co' } });
    fireEvent.click(getByText('All Companies')); // Click outside
  });

  await waitFor(() => {
    expect(getByText('airbnb.co')).toBeInTheDocument();
  });
});

it('Checks company address edit is updating data', async () => {
  const { getByText, getByDisplayValue } = render(<CompaniesDefault />);

  await waitFor(() => {
    expect(getByText('17 rue de clignancourt')).toBeDefined();
  });

  act(() => {
    fireEvent.click(getByText('17 rue de clignancourt'));
  });

  await waitFor(() => {
    expect(getByDisplayValue('17 rue de clignancourt')).toBeInTheDocument();
  });

  act(() => {
    const addressInput = getByDisplayValue('17 rue de clignancourt');

    if (!addressInput) {
      throw new Error('addressInput is null');
    }
    fireEvent.change(addressInput, {
      target: { value: '21 rue de clignancourt' },
    });
    fireEvent.click(getByText('All Companies')); // Click outside
  });

  await waitFor(() => {
    expect(getByText('21 rue de clignancourt')).toBeInTheDocument();
  });
});

it('Checks insert data is appending a new line', async () => {
  const { getByText, getByTestId, container } = render(<CompaniesDefault />);

  await waitFor(() => {
    expect(getByText('Airbnb')).toBeDefined();
  });
  const tableRows = container.querySelectorAll<HTMLElement>('table tbody tr');

  expect(tableRows.length).toBe(6);

  act(() => {
    fireEvent.click(getByTestId('add-button'));
  });

  await waitFor(() => {
    const tableRows = container.querySelectorAll<HTMLElement>('table tbody tr');

    expect(tableRows.length).toBe(7);
  });
});
