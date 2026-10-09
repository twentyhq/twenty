import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
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

export const extractValidationRuleFormFills = (
  messageParts: ExtendedUIMessagePart[],
): ValidationRuleFormFill[] =>
  messageParts.flatMap((part) => {
    if (
      !isToolUIPart(part) ||
      part.state !== 'output-available' ||
      getEffectiveToolName(part) !== FILL_VALIDATION_RULE_FORM_TOOL_NAME
    ) {
      return [];
    }

    const parsedOutput = FillValidationRuleFormOutputSchema.safeParse(
      part.output,
    );

    if (!parsedOutput.success) {
      return [];
    }

    const { validationRuleId, errorFieldMetadataId, ...fill } =
      parsedOutput.data.result;

    return [
      {
        ...fill,
        toolCallId: part.toolCallId,
        validationRuleId: validationRuleId ?? null,
        errorFieldMetadataId: errorFieldMetadataId ?? null,
      },
    ];
  });
