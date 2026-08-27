import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { useFrontComponentId } from 'twenty-sdk/front-component';

import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { shouldDisplayApplicationVariable } from 'src/front-components/utils/should-display-application-variable.util';
import { toApplicationVariableOptions } from 'src/front-components/utils/to-application-variable-options.util';

type CallRecorderApplicationVariablesState = {
  applicationId: string | undefined;
  applicationVariables: CallRecorderApplicationVariable[];
  isApplicationVariablesQueryLoading: boolean;
  errorMessage: string | undefined;
};

const APPLICATION_VARIABLES_ERROR_MESSAGE = 'Please try again later.';

const APPLICATION_VARIABLES_LOADING_STATE: CallRecorderApplicationVariablesState =
  {
    applicationId: undefined,
    applicationVariables: [],
    isApplicationVariablesQueryLoading: true,
    errorMessage: undefined,
  };

export const useCallRecorderApplicationVariables =
  (): CallRecorderApplicationVariablesState => {
    const frontComponentId = useFrontComponentId();
    const [state, setState] = useState<CallRecorderApplicationVariablesState>(
      APPLICATION_VARIABLES_LOADING_STATE,
    );

    useEffect(() => {
      let cancelled = false;

      setState(APPLICATION_VARIABLES_LOADING_STATE);

      const fetchApplicationVariables = async () => {
        try {
          const client = new MetadataApiClient();
          const frontComponentResult = await client.query({
            frontComponent: {
              __args: { id: frontComponentId },
              applicationId: true,
            },
          });

          const applicationId =
            frontComponentResult.frontComponent?.applicationId;

          if (!isNonEmptyString(applicationId)) {
            if (!cancelled) {
              setState({
                applicationId: undefined,
                applicationVariables: [],
                isApplicationVariablesQueryLoading: false,
                errorMessage: APPLICATION_VARIABLES_ERROR_MESSAGE,
              });
            }
            return;
          }

          const applicationResult = await client.query({
            findOneApplication: {
              __args: { id: applicationId },
              applicationVariables: {
                key: true,
                value: true,
                description: true,
                isSecret: true,
                isDeprecated: true,
                type: true,
                options: true,
              },
            },
          });

          if (cancelled) {
            return;
          }

          const applicationVariables = (
            applicationResult.findOneApplication?.applicationVariables ?? []
          )
            .map((variable) => ({
              ...variable,
              options: toApplicationVariableOptions(variable.options),
            }))
            .filter(shouldDisplayApplicationVariable)
            .sort((left, right) => left.key.localeCompare(right.key));

          setState({
            applicationId,
            applicationVariables,
            isApplicationVariablesQueryLoading: false,
            errorMessage: undefined,
          });
        } catch {
          if (cancelled) {
            return;
          }

          setState({
            applicationId: undefined,
            applicationVariables: [],
            isApplicationVariablesQueryLoading: false,
            errorMessage: APPLICATION_VARIABLES_ERROR_MESSAGE,
          });
        }
      };

      fetchApplicationVariables();

      return () => {
        cancelled = true;
      };
    }, [frontComponentId]);

    return state;
  };
