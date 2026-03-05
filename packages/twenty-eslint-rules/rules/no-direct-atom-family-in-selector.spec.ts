/**
 * @jest-environment node
 */
import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './no-direct-atom-family-in-selector';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Correct: using the provided get helper in createAtomComponentSelector
    {
      code: `
        const mySelector = createAtomComponentSelector({
          key: 'mySelector',
          get: ({ instanceId }) => ({ get }) => {
            const value = get(someComponentState, { instanceId });
            return value;
          },
          componentInstanceContext: MyContext,
        });
      `,
    },
    // Correct: using the provided get helper in createAtomComponentFamilySelector
    {
      code: `
        const mySelector = createAtomComponentFamilySelector({
          key: 'mySelector',
          get: ({ instanceId, familyKey }) => ({ get }) => {
            const record = get(recordStoreFamilyState, familyKey.recordId);
            return record;
          },
          componentInstanceContext: MyContext,
        });
      `,
    },
    // .atomFamily used outside of selector — should NOT trigger
    {
      code: `
        const atom = someState.atomFamily({ instanceId: 'test' });
      `,
    },
  ],
  invalid: [
    // .atomFamily() inside createAtomComponentSelector
    {
      code: `
        const mySelector = createAtomComponentSelector({
          key: 'mySelector',
          get: ({ instanceId }) => ({ get }) => {
            const atom = someState.atomFamily({ instanceId });
            return get(atom);
          },
          componentInstanceContext: MyContext,
        });
      `,
      errors: [{ messageId: 'noDirectAtomFamilyInSelector' }],
    },
    // .selectorFamily() inside createAtomComponentFamilySelector
    {
      code: `
        const mySelector = createAtomComponentFamilySelector({
          key: 'mySelector',
          get: ({ instanceId, familyKey }) => ({ get }) => {
            const selector = someSelector.selectorFamily({ instanceId });
            return get(selector);
          },
          componentInstanceContext: MyContext,
        });
      `,
      errors: [{ messageId: 'noDirectAtomFamilyInSelector' }],
    },
    // Multiple .atomFamily violations in one selector
    {
      code: `
        const mySelector = createAtomComponentFamilySelector({
          key: 'mySelector',
          get: ({ instanceId, familyKey }) => ({ get }) => {
            const a = someState.atomFamily({ instanceId });
            const b = otherState.selectorFamily({ instanceId });
            return get(a) + get(b);
          },
          componentInstanceContext: MyContext,
        });
      `,
      errors: [
        { messageId: 'noDirectAtomFamilyInSelector' },
        { messageId: 'noDirectAtomFamilyInSelector' },
      ],
    },
  ],
});
