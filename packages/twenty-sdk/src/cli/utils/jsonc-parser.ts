import * as fs from 'fs-extra';
import { type ParseError, parse as parseJsonc } from 'jsonc-parser';

export interface JsoncParseOptions {
  allowTrailingComma?: boolean;
  disallowComments?: boolean;
  allowEmptyContent?: boolean;
}

export class JsoncParseError extends Error {
  constructor(
    message: string,
    public readonly parseErrors: ParseError[],
    public readonly filePath?: string,
  ) {
    super(message);
    this.name = 'JsoncParseError';
  }
}

export const parseJsoncString = (
  content: string,
  options: JsoncParseOptions = {},
): any => {
  const parseErrors: ParseError[] = [];

  const result = parseJsonc(content, parseErrors, {
    allowTrailingComma: options.allowTrailingComma ?? true,
    disallowComments: options.disallowComments ?? false,
    allowEmptyContent: options.allowEmptyContent ?? false,
  });

  if (parseErrors.length > 0) {
    const errorMessages = parseErrors.map(
      (error) => `Line ${error.offset}: ${error.error}`,
    );
    throw new JsoncParseError(
      `JSONC parse errors:\n${errorMessages.join('\n')}`,
      parseErrors,
    );
  }

  return result;
};

export const parseTextFile = async (filePath: string) => {
  return await fs.readFile(filePath, 'utf8');
};

export const parseJsoncFile = async (
  filePath: string,
  options: JsoncParseOptions = {},
): Promise<any> => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return parseJsoncString(content, options);
  } catch (error) {
    if (error instanceof JsoncParseError) {
      throw new JsoncParseError(error.message, error.parseErrors, filePath);
    }
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
};

export const writeJsoncFile = async (
  filePath: string,
  data: any,
  options: { spaces?: number } = {},
): Promise<void> => {
  const content = JSON.stringify(data, null, options.spaces ?? 2);
  await fs.writeFile(filePath, content, 'utf8');
};
