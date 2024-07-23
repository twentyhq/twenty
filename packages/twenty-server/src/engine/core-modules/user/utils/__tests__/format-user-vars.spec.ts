import { formatUserVars } from 'src/engine/core-modules/user/utils/format-user-vars.util';

describe('formatUserVars', () => {
  it('should format user vars correctly', () => {
    const userVars = [
      {
        key: 'key1',
        value: JSON.parse('"value1"'),
        userId: 'userId1',
        workspaceId: 'workspaceId1',
      },
      {
        key: 'key2',
        value: JSON.parse('"value2"'),
        userId: 'userId1',
        workspaceId: null,
      },
      {
        key: 'key3',
        value: JSON.parse('"value3"'),
        userId: null,
        workspaceId: 'workspaceId1',
      },
    ];

    const formattedUserVars = formatUserVars(userVars);

    expect(formattedUserVars).toEqual(
      new Map([
        ['key1', JSON.parse('"value1"')],
        ['key2', JSON.parse('"value2"')],
        ['key3', JSON.parse('"value3"')],
      ]),
    );
  });

  it('should format user vars correctly when user vars are empty', () => {
    const userVars = [];

    const formattedUserVars = formatUserVars(userVars);

    expect(formattedUserVars).toEqual(new Map());
  });

  it('should overwrite user vars correctly', () => {
    const userVars1 = [
      {
        key: 'key',
        value: JSON.parse('"value1"'),
        userId: 'userId',
        workspaceId: 'workspaceId',
      },
      {
        key: 'key',
        value: JSON.parse('"value2"'),
        userId: 'userId',
        workspaceId: null,
      },
      {
        key: 'key',
        value: JSON.parse('"value3"'),
        userId: null,
        workspaceId: 'workspaceId',
      },
    ];

    const formattedUserVars1 = formatUserVars(userVars1);

    const userVars2 = [
      {
        key: 'key',
        value: JSON.parse('"value1"'),
        userId: 'userId',
        workspaceId: 'workspaceId',
      },
      {
        key: 'key',
        value: JSON.parse('"value2"'),
        userId: 'userId',
        workspaceId: null,
      },
    ];

    const formattedUserVars2 = formatUserVars(userVars2);

    const userVars3 = [
      {
        key: 'key',
        value: JSON.parse('"value2"'),
        userId: 'userId',
        workspaceId: null,
      },
      {
        key: 'key',
        value: JSON.parse('"value3"'),
        userId: null,
        workspaceId: 'workspaceId',
      },
    ];

    const formattedUserVars3 = formatUserVars(userVars3);

    const userVars4 = [
      {
        key: 'key',
        value: JSON.parse('"value1"'),
        userId: 'userId',
        workspaceId: 'workspaceId',
      },
      {
        key: 'key',
        value: JSON.parse('"value3"'),
        userId: null,
        workspaceId: 'workspaceId',
      },
    ];

    const formattedUserVars4 = formatUserVars(userVars4);

    expect(formattedUserVars1).toEqual(
      new Map([['key', JSON.parse('"value1"')]]),
    );

    expect(formattedUserVars2).toEqual(
      new Map([['key', JSON.parse('"value1"')]]),
    );

    expect(formattedUserVars3).toEqual(
      new Map([['key', JSON.parse('"value2"')]]),
    );

    expect(formattedUserVars4).toEqual(
      new Map([['key', JSON.parse('"value1"')]]),
    );
  });
});
