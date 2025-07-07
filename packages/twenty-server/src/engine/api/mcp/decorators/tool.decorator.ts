import { SetMetadata } from '@nestjs/common';

import { jsonSchema } from 'ai';
import { z } from 'zod';

export const TOOL_METADATA_KEY = 'tool';

export interface ToolMetadata {
  name: string;
  description: z.ZodType<any>;
  inputSchema: any;
}

export const toolRegistry: ToolMetadata[] = [];

/**
 * Decorator to mark a method as a Tool for MCP (Method Call Protocol)
 * This decorator registers the method's metadata in a global registry
 * 
 * @param options Optional configuration for the tool
 * @param options.name Name of the tool
 * @param options.description Description of the tool
 * @param options.parameters Zod schema for the tool parameters
 */
export const Tool = (options?: {
  name?: string;
  description?: string;
  parameters?: z.ZodType<any>;
}): MethodDecorator => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // Register the metadata
    const metadata: ToolMetadata = {
      name: options?.name,
      description: options?.description,
      inputSchema: options?.parameters
        ? jsonSchema(options.parameters)
        : undefined,
    };

    toolRegistry.push(metadata);

    SetMetadata(TOOL_METADATA_KEY, metadata)(target, propertyKey, descriptor);

    return descriptor;
  };
};
