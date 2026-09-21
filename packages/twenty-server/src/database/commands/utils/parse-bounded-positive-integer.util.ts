export const parseBoundedPositiveInteger = (
  value: string,
  optionName: string,
  maximum: number,
): number => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new Error(
      `Invalid ${optionName} "${value}". Expected a positive integer`,
    );
  }

  if (parsedValue > maximum) {
    throw new Error(`Invalid ${optionName} "${value}". Maximum is ${maximum}`);
  }

  return parsedValue;
};
