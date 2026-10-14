import { isDefined } from 'twenty-shared/utils';

export const createCodeEditorChangeHandler = <TResult>(
  onChange: (value: string) => TResult,
) => {
  return (value: string | undefined): TResult | undefined => {
    if (!isDefined(value)) {
      return;
    }

    return onChange(value);
  };
};
