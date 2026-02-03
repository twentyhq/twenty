import { z } from 'zod';

export const PropertySchemaZ = z.object({
  type: z.enum(['string', 'number', 'boolean']),
  optional: z.boolean(),
});

export const HtmlElementConfigZ = z.object({
  tag: z.string().regex(/^html-[a-z0-9]+$/, 'Tag must start with "html-"'),
  name: z
    .string()
    .regex(/^Html[A-Z]/, 'Name must be PascalCase starting with Html'),
  properties: z.record(z.string(), PropertySchemaZ),
});

export const HtmlElementConfigArrayZ = z.array(HtmlElementConfigZ);

export const UiComponentConfigZ = z.object({
  tag: z
    .string()
    .regex(/^twenty-ui-[a-z0-9-]+$/, 'Tag must start with "twenty-ui-"'),
  name: z
    .string()
    .regex(/^TwentyUi[A-Z]/, 'Name must be PascalCase starting with TwentyUi'),
  properties: z.record(z.string(), PropertySchemaZ),
  componentImport: z.string().min(1),
  componentPath: z.string().min(1),
});

export const UiComponentConfigArrayZ = z.array(UiComponentConfigZ);

export const ComponentSchemaZ = z.object({
  name: z.string().min(1),
  tagName: z.string().min(1),
  customElementName: z.string().min(1),
  properties: z.record(z.string(), PropertySchemaZ),
  events: z.array(z.string()).readonly(),
  isHtmlElement: z.boolean(),
  htmlTag: z.string().optional(),
  componentImport: z.string().optional(),
  componentPath: z.string().optional(),
});

export type PropertySchema = z.infer<typeof PropertySchemaZ>;
export type HtmlElementConfig = z.infer<typeof HtmlElementConfigZ>;
export type UiComponentConfig = z.infer<typeof UiComponentConfigZ>;
export type ComponentSchema = z.infer<typeof ComponentSchemaZ>;
