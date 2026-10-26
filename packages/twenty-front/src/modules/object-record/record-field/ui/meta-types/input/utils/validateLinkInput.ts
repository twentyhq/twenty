import { absoluteUrlSchema, isValidDomain } from 'twenty-shared/utils';

export const validateLinkInput = ({
  input,
  isDomainField,
}: {
  input: string;
  isDomainField: boolean;
}) => ({
  isValid: isDomainField
    ? isValidDomain(input)
    : absoluteUrlSchema.safeParse(input).success,
  errorMessage: '',
});
