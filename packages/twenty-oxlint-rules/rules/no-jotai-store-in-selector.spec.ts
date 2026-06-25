import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-jotai-store-in-selector';

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
            const messages = get(messagesComponentState, { instanceId });
            return messages.find((m) => m.id === familyKey.messageId);
          },
          componentInstanceContext: MyContext,
        });
      `,
    },
    {
      code: `
        const value = jotaiStore.get(someState.atom);
      `,
    },
  ],
  invalid: [
    {
      code: `
        const mySelector = createAtomComponentSelector({
          key: 'mySelector',
          get: ({ instanceId }) => ({ get }) => {
            const value = jotaiStore.get(someState.atom);
            return value;
          },
          componentInstanceContext: MyContext,
        });
      `,
      errors: [{ messageId: 'noJotaiStoreInSelector' }],
    },
    {
      code: `
        const mySelector = createAtomComponentFamilySelector({
          key: 'mySelector',
          get: ({ instanceId, familyKey }) => ({ get }) => {
            const value = jotaiStore.get(someState.atom);
            return value;
          },
          componentInstanceContext: MyContext,
        });
      `,
      errors: [{ messageId: 'noJotaiStoreInSelector' }],
    },
    {
      code: `
        const mySelector = createAtomComponentSelector({
          key: 'mySelector',
          get: ({ instanceId }) => ({ get }) => {
            jotaiStore.set(someState.atom, 'value');
            return 'value';
          },
          componentInstanceContext: MyContext,
        });
      `,
      errors: [{ messageId: 'noJotaiStoreInSelector' }],
    },
    {
      code: `
        const mySelector = createAtomComponentFamilySelector({
          key: 'mySelector',
          get: ({ instanceId, familyKey }) => ({ get }) => {
            const a = jotaiStore.get(stateA.atom);
            const b = jotaiStore.get(stateB.atom);
            return a + b;
          },
          componentInstanceContext: MyContext,
        });
      `,
      errors: [
        { messageId: 'noJotaiStoreInSelector' },
        { messageId: 'noJotaiStoreInSelector' },
      ],
    },
  ],
});
