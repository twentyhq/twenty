import { isSymbol } from '@sniptt/guards';

type AssertCssArgumentIsStringifiableInput = {
  functionName: string;
  argument: unknown;
};

// The native api converts its arguments through WebIDL DOMString, which throws
// on a symbol rather than producing its description.
export const assertCssArgumentIsStringifiable = ({
  functionName,
  argument,
}: AssertCssArgumentIsStringifiableInput): void => {
  if (isSymbol(argument)) {
    throw new TypeError(
      `Failed to execute '${functionName}' on 'CSS': Cannot convert a Symbol value to a string`,
    );
  }
};
