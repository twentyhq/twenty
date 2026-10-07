import { expect, userEvent, waitFor } from 'storybook/test';

type ReplaceAutocompleteQueryAtWorkerPaceParams = {
  input: HTMLElement;
  autocompleteState: HTMLElement;
  query: string;
};

export const replaceAutocompleteQueryAtWorkerPace = async ({
  input,
  autocompleteState,
  query,
}: ReplaceAutocompleteQueryAtWorkerPaceParams): Promise<void> => {
  await userEvent.clear(input);
  await waitFor(() =>
    expect(autocompleteState).toHaveTextContent('Query: empty;'),
  );

  let typedQuery = '';

  for (const character of query) {
    typedQuery += character;
    const expectedAutocompleteState = `Query: ${typedQuery};`;

    await userEvent.keyboard(character);
    await waitFor(() =>
      expect(autocompleteState).toHaveTextContent(expectedAutocompleteState),
    );
  }
};
