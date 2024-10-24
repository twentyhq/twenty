import { expect } from '@storybook/test';

import { OperationType } from '@/apollo/types/operation-type';

import formatTitle from '../formatTitle';

describe('formatTitle', () => {
  it('should correctly format the title', () => {
    const res = formatTitle(
      OperationType.Query,
      'default',
      'GetCurrentUser',
      1000,
    );
    const title = res[0];

    expect(title).toBe(
      '%c apollo %cquery %cdefault::%cGetCurrentUser %c(in 1000 ms)',
    );
  });
});
