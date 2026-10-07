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

const USER_VALUES = [
  {
    applicationVariableId: 'record-my-meetings-id',
    value: 'enc:on' as EncryptedString,
  },
  {
    applicationVariableId: 'personal-api-key-id',
    value: 'enc:key' as EncryptedString,
  },
];

const getDisplayValue = ({
  value,
  isSecret,
}: {
  value: EncryptedString;
  isSecret: boolean;
}) => (isSecret ? `masked ${value}` : `plaintext of ${value}`);

describe('toUserApplicationVariableValues', () => {
  it('should use the member value, else the default, else an empty string', () => {
    const values = toUserApplicationVariableValues({
      flatUserApplicationVariables: FLAT_USER_APPLICATION_VARIABLES,
      userValues: USER_VALUES,
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
      userValues: USER_VALUES,
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
