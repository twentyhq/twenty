import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-surface-scoped-state-outside-owner';

type RestrictedState = {
  importPath: string;
  ownerModulePath: string;
  useInstead: string;
};

type RuleOptions = {
  restrictedStates?: RestrictedState[];
};

// Some component states (dropdown, modal) are keyed by an id their owner
// module rewrites per workspace surface. Reading such a state with the raw id
// compiles, is correct on the main surface, and silently returns the default
// inside a side panel. The owner module exposes a hook that resolves the id,
// so every other module has to go through it.
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing a surface-scoped component state outside the module that owns it; read it through the owner hook instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          restrictedStates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                importPath: { type: 'string' },
                ownerModulePath: { type: 'string' },
                useInstead: { type: 'string' },
              },
              required: ['importPath', 'ownerModulePath', 'useInstead'],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useOwnerHook:
        "'{{ stateName }}' is keyed by a surface-scoped id that only its owner module resolves, so a direct read misses inside a side panel. Use {{ useInstead }} instead.",
    },
  },
  create: (context) => {
    const [options] = context.options as [RuleOptions | undefined];
    const restrictedStates = options?.restrictedStates ?? [];
    const filename = context.filename.replace(/\\/g, '/');

    return {
      ImportDeclaration: (node: any) => {
        const importPath = node.source.value;

        const restrictedState = restrictedStates.find(
          (state) => state.importPath === importPath,
        );

        if (
          restrictedState === undefined ||
          filename.includes(restrictedState.ownerModulePath)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'useOwnerHook',
          data: {
            stateName: importPath.split('/').pop() ?? importPath,
            useInstead: restrictedState.useInstead,
          },
        });
      },
    };
  },
});
