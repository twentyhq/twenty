import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

const HELP_CENTER_MAX_RESULTS = 5;
const SSE_DATA_PREFIX = 'data:';
const UNRECOGNIZED_SHAPE_ERROR =
  'Help center search returned a response in an unrecognized shape';

const HelpCenterJsonRpcResponseZodSchema = z.union([
  z.object({ error: z.object({ message: z.string() }) }),
  z.object({
    result: z.object({
      isError: z.boolean().optional(),
      content: z.array(z.object({ text: z.string().optional() })),
    }),
  }),
]);

export type HelpCenterResultsExtraction =
  | { isReadable: true; results: string[] }
  | { isReadable: false; error: string };

const parseSseData = (body: string): unknown => {
  const dataLine = body
    .split('\n')
    .find((line) => line.startsWith(SSE_DATA_PREFIX));

  if (!isDefined(dataLine)) {
    return undefined;
  }

  try {
    return JSON.parse(dataLine.slice(SSE_DATA_PREFIX.length));
  } catch {
    return undefined;
  }
};

export const extractHelpCenterResults = (
  body: unknown,
): HelpCenterResultsExtraction => {
  const parsed = HelpCenterJsonRpcResponseZodSchema.safeParse(
    isString(body) ? parseSseData(body) : undefined,
  );

  if (!parsed.success) {
    return { isReadable: false, error: UNRECOGNIZED_SHAPE_ERROR };
  }

  if ('error' in parsed.data) {
    return { isReadable: false, error: parsed.data.error.message };
  }

  const texts = parsed.data.result.content
    .map((item) => item.text)
    .filter(isDefined);

  if (parsed.data.result.isError) {
    return {
      isReadable: false,
      error: texts.join('\n') || UNRECOGNIZED_SHAPE_ERROR,
    };
  }

  return { isReadable: true, results: texts.slice(0, HELP_CENTER_MAX_RESULTS) };
};
