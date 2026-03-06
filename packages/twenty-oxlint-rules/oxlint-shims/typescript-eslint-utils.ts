// Shim for @typescript-eslint/utils, which pulls in eslint core and node:fs
// that are unavailable in Oxlint's JS plugin runtime.

type RuleListener = Record<string, ((...args: unknown[]) => void) | undefined>;

type RuleMeta = {
  type?: string;
  docs?: Record<string, unknown>;
  messages?: Record<string, string>;
  schema?: unknown[];
  fixable?: string;
  hasSuggestions?: boolean;
};

type RuleContext = {
  options?: unknown[];
  [key: string]: unknown;
};

type RuleDefinition<TOptions extends readonly unknown[]> = {
  name: string;
  meta: RuleMeta;
  defaultOptions?: TOptions;
  create: (context: RuleContext, options: TOptions) => RuleListener;
};

// Proxy-based enum: AST_NODE_TYPES.Foo returns 'Foo' for every key.
export const AST_NODE_TYPES: Record<string, string> = new Proxy(
  {} as Record<string, string>,
  { get: (_target, key: string) => key },
);

export const TSESTree = { AST_NODE_TYPES };

export const ESLintUtils = {
  RuleCreator:
    (_urlCreator: (name: string) => string) =>
    <TOptions extends readonly unknown[], TMessageIds extends string>({
      name,
      meta,
      defaultOptions = [] as unknown as TOptions,
      create,
    }: RuleDefinition<TOptions>) => ({
      meta: {
        ...meta,
        docs: { ...(meta.docs ?? {}), url: '' },
      },
      defaultOptions,
      create(context: RuleContext): RuleListener {
        let options: TOptions;
        try {
          const contextOptions = context.options;
          if (contextOptions && contextOptions.length > 0) {
            options = contextOptions.map((option: unknown, index: number) => ({
              ...((defaultOptions[index] as Record<string, unknown>) || {}),
              ...(option as Record<string, unknown>),
            })) as unknown as TOptions;
          } else {
            options = defaultOptions;
          }
        } catch {
          options = defaultOptions;
        }
        return create(context, options);
      },
    }),

  // Oxlint's runtime has no TypeScript parser services.
  getParserServices: (
    _context: unknown,
    _allowWithoutFullTypeInfo?: boolean,
  ) => null,
};

export const TSESLint = {};
