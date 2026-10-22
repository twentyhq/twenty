import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';

const toInput = (defaultSenderDomain: unknown) =>
  plainToInstance(UpdateWorkspaceInput, { defaultSenderDomain });

describe('UpdateWorkspaceInput defaultSenderDomain', () => {
  it('normalizes then accepts a padded, mixed-case, @-prefixed domain', async () => {
    const input = toInput(' @Example.COM ');

    expect(await validate(input)).toEqual([]);
    expect(input.defaultSenderDomain).toBe('example.com');
  });

  it('turns an empty string into null and accepts it', async () => {
    const input = toInput('');

    expect(await validate(input)).toEqual([]);
    expect(input.defaultSenderDomain).toBeNull();
  });

  it('accepts a punycode top-level domain', async () => {
    expect(await validate(toInput('example.xn--p1ai'))).toEqual([]);
  });

  it.each([
    'has space.com',
    'example.com/path',
    'nodot',
    'a@b.com',
    '-example.com',
    'example-.com',
    'localhost',
    '192.168.0.1',
  ])('rejects a non-domain value: %s', async (value) => {
    expect(await validate(toInput(value))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'defaultSenderDomain' }),
      ]),
    );
  });

  it('explains what a valid domain looks like', async () => {
    const [error] = await validate(toInput('nodot'));

    expect(Object.values(error.constraints ?? {})).toEqual([
      'defaultSenderDomain must be a domain such as example.com',
    ]);
  });
});
