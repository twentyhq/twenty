import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isToolUIPart } from 'ai';
import { z } from 'zod';

import { getEffectiveToolName } from '@/ai/utils/getEffectiveToolName';
import { FILL_VALIDATION_RULE_FORM_TOOL_NAME } from '@/validation-rules/constants/FillValidationRuleFormToolName';
import { type ValidationRuleFormFill } from '@/validation-rules/types/ValidationRuleFormFill';

const FillValidationRuleFormOutputSchema = z.object({
  success: z.literal(true),
  result: z.object({
    objectMetadataId: z.string(),
    validationRuleId: z.string().nullish(),
    name: z.string().default(''),
    expression: z.string(),
    message: z.string().default(''),
    errorFieldMetadataId: z.string().nullish(),
  }),
});

export const getValidationRuleFormFillFromToolPart = (
  part: ExtendedUIMessagePart,
): ValidationRuleFormFill | null => {
  if (
    !isToolUIPart(part) ||
    part.state !== 'output-available' ||
    getEffectiveToolName(part) !== FILL_VALIDATION_RULE_FORM_TOOL_NAME
  ) {
    return null;
  }

  const parsedOutput = FillValidationRuleFormOutputSchema.safeParse(
    part.output,
  );

  if (!parsedOutput.success) {
    return null;
  }

  const { validationRuleId, errorFieldMetadataId, ...fill } =
    parsedOutput.data.result;

  return {
    ...fill,
    validationRuleId: validationRuleId ?? null,
    errorFieldMetadataId: errorFieldMetadataId ?? null,
  };
};
