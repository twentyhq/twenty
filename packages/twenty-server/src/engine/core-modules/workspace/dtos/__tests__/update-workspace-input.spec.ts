import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';

const toInput = (defaultSenderDomain: unknown) =>
  plainToInstance(UpdateWorkspaceInput, { defaultSenderDomain });

describe('UpdateWorkspaceInput defaultSenderDomain', () => {
  it('normalizes then accepts a padded, mixed-case, @-prefixed domain', async () => {
    const input = toInput(' @GetIndexed.AI ');

    expect(await validate(input)).toEqual([]);
    expect(input.defaultSenderDomain).toBe('getindexed.ai');
  });

  it('turns an empty string into null and accepts it', async () => {
    const input = toInput('');

    expect(await validate(input)).toEqual([]);
    expect(input.defaultSenderDomain).toBeNull();
  });

  it.each(['has space.com', 'example.com/path', 'nodot', 'a@b.com'])(
    'rejects a non-domain value: %s',
    async (value) => {
      expect(await validate(toInput(value))).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'defaultSenderDomain' }),
        ]),
      );
    },
  );

  it('explains what a valid domain looks like', async () => {
    const [error] = await validate(toInput('nodot'));

    expect(Object.values(error.constraints ?? {})).toEqual([
      'defaultSenderDomain must be a domain such as example.com',
    ]);
  });
});
