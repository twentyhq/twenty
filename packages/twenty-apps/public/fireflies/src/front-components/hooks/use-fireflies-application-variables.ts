import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FirefliesApplicationVariable } from 'src/front-components/types/fireflies-application-variable.type';
import { shouldDisplayApplicationVariable } from 'src/front-components/utils/should-display-application-variable.util';

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
    const [state, setState] = useState<FirefliesApplicationVariablesState>(
      APPLICATION_VARIABLES_LOADING_STATE,
    );

    useEffect(() => {
      let cancelled = false;

      setState(APPLICATION_VARIABLES_LOADING_STATE);

      const fetchApplicationVariables = async () => {
        try {
          const client = new MetadataApiClient();
          const applicationResult = await client.query({
            findOneApplication: {
              __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
              id: true,
              applicationVariables: {
                key: true,
                value: true,
                description: true,
                isSecret: true,
                isDeprecated: true,
              },
            },
          });

          if (cancelled) {
            return;
          }

          const applicationId = applicationResult.findOneApplication?.id;

          if (!isNonEmptyString(applicationId)) {
            setState({
              applicationId: undefined,
              applicationVariables: [],
              isApplicationVariablesQueryLoading: false,
              errorMessage: APPLICATION_VARIABLES_ERROR_MESSAGE,
            });
            return;
          }

          const applicationVariables = [
            ...(applicationResult.findOneApplication?.applicationVariables ??
              []),
          ]
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
    }, []);

    return state;
  };
