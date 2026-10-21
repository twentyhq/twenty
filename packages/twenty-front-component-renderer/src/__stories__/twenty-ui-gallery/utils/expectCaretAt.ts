import { expect, waitFor } from 'storybook/test';

type ExpectCaretAtParams = {
  input: HTMLInputElement;
  offset: number;
};

export const expectCaretAt = async ({
  input,
  offset,
}: ExpectCaretAtParams): Promise<void> => {
  await waitFor(() => {
    expect(input.selectionStart).toBe(offset);
    expect(input.selectionEnd).toBe(offset);
  });
};
