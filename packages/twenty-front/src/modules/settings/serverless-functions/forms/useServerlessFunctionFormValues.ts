import { Dispatch, SetStateAction, useState } from 'react';

export type ServerlessFunctionFormValues = {
  name: string;
  description: string;
  code: string;
  input: string;
  output: string;
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
    output: 'Enter an input above then press "run Function"',
  });

  return [formValues, setFormValues];
};
