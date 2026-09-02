import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';

type GetApplicationVariableValueParams = {
  applicationVariables: Pick<
    CallRecorderApplicationVariable,
    'key' | 'value'
  >[];
  variableKey: string;
};

export const getApplicationVariableValue = ({
  applicationVariables,
  variableKey,
}: GetApplicationVariableValueParams): string =>
  applicationVariables.find((variable) => variable.key === variableKey)
    ?.value ?? '';
