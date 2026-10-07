import { FieldMetadataType } from 'twenty-shared/types';

import { toUserApplicationVariableValues } from 'src/engine/core-modules/application/application-variable/utils/to-user-application-variable-values.util';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';

const buildFlatUserApplicationVariable = ({
  id,
  key,
  isSecret = false,
  defaultValue = null,
}: {
  id: string;
  key: string;
  isSecret?: boolean;
  defaultValue?: string | null;
}) =>
  ({
    id,
    key,
    label: key,
    description: '',
    type: FieldMetadataType.TEXT,
    options: null,
    isSecret,
    isRequired: false,
    isDeprecated: false,
    defaultValue,
  }) satisfies Partial<FlatApplicationVariable>;

const FLAT_USER_APPLICATION_VARIABLES = [
  buildFlatUserApplicationVariable({
    id: 'record-my-meetings-id',
    key: 'RECORD_MY_MEETINGS',
    defaultValue: 'off',
  }),
  buildFlatUserApplicationVariable({
    id: 'language-id',
    key: 'LANGUAGE',
    defaultValue: 'en',
  }),
  buildFlatUserApplicationVariable({ id: 'nickname-id', key: 'NICKNAME' }),
  buildFlatUserApplicationVariable({
    id: 'personal-api-key-id',
    key: 'PERSONAL_API_KEY',
    isSecret: true,
  }),
];

const USER_WORKSPACE_ID = 'user-workspace-id';

const USER_APPLICATION_VARIABLE_VALUE_MAPS = {
  byApplicationVariableId: {
    'record-my-meetings-id': {
      [USER_WORKSPACE_ID]: 'enc:on' as EncryptedString,
      'other-user-workspace-id': 'enc:off' as EncryptedString,
    },
    'personal-api-key-id': {
      [USER_WORKSPACE_ID]: 'enc:key' as EncryptedString,
    },
  },
};

const getDisplayValue = ({
  value,
  isSecret,
}: {
  value: EncryptedString;
  isSecret: boolean;
}) => (isSecret ? `masked ${value}` : `plaintext of ${value}`);

describe('toUserApplicationVariableValues', () => {
  it.each(['', 'false', '0'])(
    'should preserve an explicit %j member value instead of the default',
    (memberValue) => {
      const values = toUserApplicationVariableValues({
        flatUserApplicationVariables: FLAT_USER_APPLICATION_VARIABLES,
        userApplicationVariableValueMaps: USER_APPLICATION_VARIABLE_VALUE_MAPS,
        userWorkspaceId: USER_WORKSPACE_ID,
        shouldMaskSecret: true,
        getDisplayValue: () => memberValue,
      });

      expect(
        values.find(({ key }) => key === 'RECORD_MY_MEETINGS')?.value,
      ).toBe(memberValue);
      expect(values.find(({ key }) => key === 'LANGUAGE')?.value).toBe('en');
    },
  );

  it('should use the member value, else the default, else an empty string', () => {
    const values = toUserApplicationVariableValues({
      flatUserApplicationVariables: FLAT_USER_APPLICATION_VARIABLES,
      userApplicationVariableValueMaps: USER_APPLICATION_VARIABLE_VALUE_MAPS,
      userWorkspaceId: USER_WORKSPACE_ID,
      shouldMaskSecret: false,
      getDisplayValue,
    });

    expect(values.map(({ key, value }) => [key, value])).toEqual([
      ['RECORD_MY_MEETINGS', 'plaintext of enc:on'],
      ['LANGUAGE', 'en'],
      ['NICKNAME', ''],
      ['PERSONAL_API_KEY', 'plaintext of enc:key'],
    ]);
  });

  it('should mask secrets only when asked to', () => {
    const values = toUserApplicationVariableValues({
      flatUserApplicationVariables: FLAT_USER_APPLICATION_VARIABLES,
      userApplicationVariableValueMaps: USER_APPLICATION_VARIABLE_VALUE_MAPS,
      userWorkspaceId: USER_WORKSPACE_ID,
      shouldMaskSecret: true,
      getDisplayValue,
    });

    expect(values.map(({ key, value }) => [key, value])).toEqual([
      ['RECORD_MY_MEETINGS', 'plaintext of enc:on'],
      ['LANGUAGE', 'en'],
      ['NICKNAME', ''],
      ['PERSONAL_API_KEY', 'masked enc:key'],
    ]);
  });
});
