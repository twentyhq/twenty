import { isDefined } from 'twenty-shared/utils';

import { type UserApplicationVariableValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/user-application-variable-value.dto';
import { type UserApplicationVariableValueMaps } from 'src/engine/core-modules/application/application-variable/types/user-application-variable-value-maps.type';
import { type UserApplicationVariableValueEntity } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.entity';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';

export const toUserApplicationVariableValues = ({
  flatUserApplicationVariables,
  userApplicationVariableValueMaps,
  userWorkspaceId,
  shouldMaskSecret,
  getDisplayValue,
}: {
  flatUserApplicationVariables: Pick<
    FlatApplicationVariable,
    | 'id'
    | 'key'
    | 'label'
    | 'description'
    | 'type'
    | 'options'
    | 'isSecret'
    | 'isRequired'
    | 'isDeprecated'
    | 'defaultValue'
  >[];
  userApplicationVariableValueMaps: UserApplicationVariableValueMaps;
  userWorkspaceId: string;
  shouldMaskSecret: boolean;
  getDisplayValue: (
    userValue: Pick<UserApplicationVariableValueEntity, 'value'> & {
      isSecret: boolean;
    },
  ) => string;
}): UserApplicationVariableValueDTO[] =>
  flatUserApplicationVariables.map((flatApplicationVariable) => {
    const userValue =
      userApplicationVariableValueMaps.byApplicationVariableId[
        flatApplicationVariable.id
      ]?.[userWorkspaceId];

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
