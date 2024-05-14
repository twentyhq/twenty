import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

export const stripSimpleQuotesFromString = <Input extends string>(
  value: Input,
) =>
  (simpleQuotesStringSchema.safeParse(value).success
    ? value.slice(1, -1)
    : value) as Input extends `'${infer Output}'` ? Output : Input;
