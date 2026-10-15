import { findSingleOperationType } from 'src/engine/core-modules/usage-limit/utils/find-single-operation-type.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

describe('findSingleOperationType', () => {
  it('returns the operation type of a one-item list', () => {
    expect(findSingleOperationType([UsageOperationType.EMAIL_SEND])).toBe(
      UsageOperationType.EMAIL_SEND,
    );
  });

  it('returns null for several operation types', () => {
    expect(
      findSingleOperationType([
        UsageOperationType.AI_CHAT_TOKEN,
        UsageOperationType.WEB_SEARCH,
      ]),
    ).toBeNull();
  });
});
