import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type ApplicationVariableScope } from 'src/front-components/types/application-variable-scope.type';
import { resolveCallRecorderApplicationId } from 'src/front-components/utils/resolve-call-recorder-application-id.util';

type UpdateApplicationVariableParams = {
  variableKey: string;
  value: string;
  scope: ApplicationVariableScope;
};

type UpdateApplicationVariableState = {
  updateApplicationVariable: (
    params: UpdateApplicationVariableParams,
  ) => Promise<boolean>;
};

export const useUpdateApplicationVariable =
  (): UpdateApplicationVariableState => {
    const updateApplicationVariable = async ({
      variableKey,
      value,
      scope,
    }: UpdateApplicationVariableParams): Promise<boolean> => {
      try {
        const client = new MetadataApiClient();

        if (scope === 'USER') {
          await client.mutation({
            updateMyUserApplicationVariable: {
              __args: {
                applicationUniversalIdentifier:
                  APPLICATION_UNIVERSAL_IDENTIFIER,
                key: variableKey,
                value,
              },
            },
          });

          return true;
        }

        const applicationId = await resolveCallRecorderApplicationId();

        await client.mutation({
          updateOneApplicationVariable: {
            __args: { key: variableKey, value, applicationId },
          },
        });

        return true;
      } catch {
        return false;
      }
    };

    return { updateApplicationVariable };
  };
