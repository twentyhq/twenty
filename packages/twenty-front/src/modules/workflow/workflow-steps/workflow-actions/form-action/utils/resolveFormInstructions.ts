import { isString } from '@sniptt/guards';
import { isDefined, resolveInput } from 'twenty-shared/utils';

export const resolveFormInstructions = ({
  instructions,
  context,
}: {
  instructions: string | undefined;
  context: Record<string, unknown>;
}): string | undefined => {
  if (!isDefined(instructions) || instructions.trim() === '') {
    return undefined;
  }

  const resolvedInstructions = resolveInput(instructions, context);

  if (!isDefined(resolvedInstructions)) {
    return instructions;
  }

  // a lone variable resolves to the value itself, which may not be text
  return isString(resolvedInstructions)
    ? resolvedInstructions
    : JSON.stringify(resolvedInstructions);
};
