/**
 * @jest-environment node
 */
import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './no-jotai-store-in-selector';

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
            const messages = get(messagesComponentState, { instanceId });
            return messages.find((m) => m.id === familyKey.messageId);
          },
          componentInstanceContext: MyContext,
        });
      `,
    },
    // jotaiStore.get used outside of selector — should NOT trigger
    {
      code: `
        const value = jotaiStore.get(someState.atom);
      `,
    },
  ],
  invalid: [
    // jotaiStore.get inside createAtomComponentSelector
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
    // jotaiStore.get inside createAtomComponentFamilySelector
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
    // jotaiStore.set inside createAtomComponentSelector
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
    // Multiple jotaiStore violations in one selector
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
