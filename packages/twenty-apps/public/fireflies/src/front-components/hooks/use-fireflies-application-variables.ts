import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { useFrontComponentId } from 'twenty-sdk/front-component';

import { type FirefliesApplicationVariable } from 'src/front-components/types/fireflies-application-variable.type';

type FirefliesApplicationVariablesState = {
  applicationId: string | undefined;
  applicationVariables: FirefliesApplicationVariable[];
  isApplicationVariablesQueryLoading: boolean;
  errorMessage: string | undefined;
};

const APPLICATION_VARIABLES_ERROR_MESSAGE = 'Please try again later.';

const APPLICATION_VARIABLES_LOADING_STATE: FirefliesApplicationVariablesState =
  {
    applicationId: undefined,
    applicationVariables: [],
    isApplicationVariablesQueryLoading: true,
    errorMessage: undefined,
  };

export const useFirefliesApplicationVariables =
  (): FirefliesApplicationVariablesState => {
    const frontComponentId = useFrontComponentId();
    const [state, setState] = useState<FirefliesApplicationVariablesState>(
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
              },
            },
          });

          if (cancelled) {
            return;
          }

          const applicationVariables = [
            ...(applicationResult.findOneApplication?.applicationVariables ??
              []),
          ].sort((left, right) => left.key.localeCompare(right.key));

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
