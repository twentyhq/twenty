import { Dispatch, SetStateAction, useState } from 'react';

export type ServerlessFunctionFormValues = {
  name: string;
  description: string | undefined;
  code: string | undefined;
  input: string | undefined;
  output: string | undefined;
};

export type SetServerlessFunctionFormValues = Dispatch<
  SetStateAction<ServerlessFunctionFormValues>
>;

export const useServerlessFunctionFormValues = (): [
  ServerlessFunctionFormValues,
  SetServerlessFunctionFormValues,
] => {
  const [formValues, setFormValues] = useState<ServerlessFunctionFormValues>({
    name: '',
    description: '',
    code: '',
    input: '{}',
    output: '{}',
  });

  return [formValues, setFormValues];
};
