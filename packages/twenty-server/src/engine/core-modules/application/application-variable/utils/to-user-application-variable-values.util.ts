import { isDefined } from 'twenty-shared/utils';

import { type UserApplicationVariableValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/user-application-variable-value.dto';
import { type UserApplicationVariableValueEntity } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.entity';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';

export const toUserApplicationVariableValues = ({
  userFlatApplicationVariables,
  userValues,
  shouldMaskSecret,
  getDisplayValue,
}: {
  userFlatApplicationVariables: FlatApplicationVariable[];
  userValues: Pick<
    UserApplicationVariableValueEntity,
    'applicationVariableId' | 'value'
  >[];
  shouldMaskSecret: boolean;
  getDisplayValue: (
    userValue: Pick<UserApplicationVariableValueEntity, 'value'> & {
      isSecret: boolean;
    },
  ) => string;
}): UserApplicationVariableValueDTO[] => {
  const userValueByApplicationVariableId = new Map(
    userValues.map(({ applicationVariableId, value }) => [
      applicationVariableId,
      value,
    ]),
  );

  return userFlatApplicationVariables.map((flatApplicationVariable) => {
    const userValue = userValueByApplicationVariableId.get(
      flatApplicationVariable.id,
    );

    return {
      key: flatApplicationVariable.key,
      label: flatApplicationVariable.label,
      description: flatApplicationVariable.description,
      type: flatApplicationVariable.type,
      options: flatApplicationVariable.options,
      isSecret: flatApplicationVariable.isSecret,
      isRequired: flatApplicationVariable.isRequired,
      isDeprecated: flatApplicationVariable.isDeprecated,
      // Secrets have no default, so the fallback never needs masking.
      value: isDefined(userValue)
        ? getDisplayValue({
            value: userValue,
            isSecret: flatApplicationVariable.isSecret && shouldMaskSecret,
          })
        : (flatApplicationVariable.defaultValue ?? ''),
    };
  });
};
