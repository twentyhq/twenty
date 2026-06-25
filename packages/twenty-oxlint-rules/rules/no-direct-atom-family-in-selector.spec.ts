import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-direct-atom-family-in-selector';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
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
    {
      code: `
        const atom = someState.atomFamily({ instanceId: 'test' });
      `,
    },
  ],
  invalid: [
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
