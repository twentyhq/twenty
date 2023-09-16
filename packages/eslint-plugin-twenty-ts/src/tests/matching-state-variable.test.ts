import { RuleTester } from 'eslint';
import rule from "../rules/matching-state-variable";

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
});

ruleTester.run('matching-state-variable', rule, {
  valid: [
    {
      code: 'const myState = useRecoilValue(someAtom);',
    },
    {
      code: 'const [myState, setMyState] = useRecoilState(someAtom);',
    },
  ],
  invalid: [
    {
      code: 'const myValue = useRecoilValue(someAtom);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const some = useRecoilValue(someAtom);',
    },
    {
      code: 'const [myValue, setMyValue] = useRecoilState(someAtom);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
      output: 'const [some, setSome] = useRecoilState(someAtom);',
    },
  ],
});
