import { type I18n, type MessageDescriptor } from '@lingui/core';

import { translateUserFriendlyMessageDescriptors } from 'src/engine/core-modules/i18n/utils/translate-user-friendly-message-descriptors.util';

const buildDescriptor = (id: string): MessageDescriptor => ({
  id,
  message: id,
});

const i18nMock = {
  _: (descriptor: MessageDescriptor) => `tr:${descriptor.id}`,
} as unknown as I18n;

describe('translateUserFriendlyMessageDescriptors', () => {
  it('translates a top-level userFriendlyMessage descriptor to a string', () => {
    const result = translateUserFriendlyMessageDescriptors(
      { userFriendlyMessage: buildDescriptor('top-level') },
      i18nMock,
    );

    expect(result).toEqual({ userFriendlyMessage: 'tr:top-level' });
  });

  it('leaves a userFriendlyMessage value untouched when it is already a string', () => {
    const result = translateUserFriendlyMessageDescriptors(
      { userFriendlyMessage: 'already a string' },
      i18nMock,
    );

    expect(result).toEqual({ userFriendlyMessage: 'already a string' });
  });

  it('does not translate descriptors stored under other keys', () => {
    const descriptor = buildDescriptor('not-user-friendly');

    const result = translateUserFriendlyMessageDescriptors(
      { someOtherKey: descriptor },
      i18nMock,
    );

    expect(result).toEqual({
      someOtherKey: { id: 'not-user-friendly', message: 'not-user-friendly' },
    });
  });

  it('translates userFriendlyMessage descriptors nested inside arrays of objects', () => {
    const result = translateUserFriendlyMessageDescriptors(
      {
        errors: [
          { code: 'A', userFriendlyMessage: buildDescriptor('first') },
          { code: 'B', userFriendlyMessage: buildDescriptor('second') },
        ],
      },
      i18nMock,
    );

    expect(result).toEqual({
      errors: [
        { code: 'A', userFriendlyMessage: 'tr:first' },
        { code: 'B', userFriendlyMessage: 'tr:second' },
      ],
    });
  });

  it('preserves primitives, null and undefined values found along the way', () => {
    const result = translateUserFriendlyMessageDescriptors(
      {
        statusCode: 400,
        message: 'Validation failed',
        eventId: null,
        traceId: undefined,
        nested: { count: 0, flag: false },
      },
      i18nMock,
    );

    expect(result).toEqual({
      statusCode: 400,
      message: 'Validation failed',
      eventId: null,
      traceId: undefined,
      nested: { count: 0, flag: false },
    });
  });

  it('handles a realistic metadata-validation payload with both top-level and per-error descriptors', () => {
    const result = translateUserFriendlyMessageDescriptors(
      {
        userFriendlyMessage: buildDescriptor('Field value is required'),
        summary: { totalErrors: 1, viewGroup: 1 },
        errors: {
          viewGroup: [
            {
              status: 'fail',
              type: 'create',
              metadataName: 'viewGroup',
              errors: [
                {
                  code: 'INVALID_VIEW_DATA',
                  message: 'Field value is required',
                  userFriendlyMessage: buildDescriptor(
                    'Field value is required',
                  ),
                },
              ],
            },
          ],
        },
      },
      i18nMock,
    );

    expect(result).toEqual({
      userFriendlyMessage: 'tr:Field value is required',
      summary: { totalErrors: 1, viewGroup: 1 },
      errors: {
        viewGroup: [
          {
            status: 'fail',
            type: 'create',
            metadataName: 'viewGroup',
            errors: [
              {
                code: 'INVALID_VIEW_DATA',
                message: 'Field value is required',
                userFriendlyMessage: 'tr:Field value is required',
              },
            ],
          },
        ],
      },
    });
  });

  it('does not mutate the input payload', () => {
    const descriptor = buildDescriptor('mutation-check');
    const input = { userFriendlyMessage: descriptor, nested: { value: 1 } };

    const result = translateUserFriendlyMessageDescriptors(input, i18nMock);

    expect(input.userFriendlyMessage).toBe(descriptor);
    expect(result).not.toBe(input);
    expect(result).toEqual({
      userFriendlyMessage: 'tr:mutation-check',
      nested: { value: 1 },
    });
  });
});
