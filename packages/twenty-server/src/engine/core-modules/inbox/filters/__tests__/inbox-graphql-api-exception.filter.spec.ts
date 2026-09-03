import {
  ConflictError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InboxGraphqlApiExceptionFilter } from 'src/engine/core-modules/inbox/filters/inbox-graphql-api-exception.filter';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';

describe('InboxGraphqlApiExceptionFilter', () => {
  const filter = new InboxGraphqlApiExceptionFilter();

  const catchCode = (code: keyof typeof InboxExceptionCode) => () =>
    filter.catch(new InboxException('some message', code));

  // Without this mapping every inbox error reaches the client as a server
  // failure, so a missing item reads as the server being broken
  it.each([
    [InboxExceptionCode.INBOX_ITEM_NOT_FOUND, NotFoundError],
    [InboxExceptionCode.UNKNOWN_INBOX_QUEUE, NotFoundError],
    [InboxExceptionCode.INBOX_ITEM_CHANGED, ConflictError],
    [InboxExceptionCode.INVALID_INBOX_ACTION, UserInputError],
    [InboxExceptionCode.UNKNOWN_INBOX_ITEM_TYPE, UserInputError],
  ])(
    'should turn %s into the matching GraphQL error',
    (code, expectedError) => {
      // Act & Assert
      expect(catchCode(code)).toThrow(expectedError);
    },
  );

  it('should keep the message the exception was built with', () => {
    // Act & Assert
    expect(catchCode(InboxExceptionCode.INBOX_ITEM_NOT_FOUND)).toThrow(
      'some message',
    );
  });
});
