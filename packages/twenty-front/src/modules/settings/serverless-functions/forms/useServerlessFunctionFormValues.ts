import { Dispatch, SetStateAction, useState } from 'react';

export type ServerlessFunctionFormValues = {
  name: string;
  description: string;
  code: string;
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
  });

  return [formValues, setFormValues];
};
