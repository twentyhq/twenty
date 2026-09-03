import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  getApplicationVariable,
  useFrontComponentId,
} from 'twenty-sdk/front-component';

import { CALL_RECORDER_MAPPED_VARIABLE_KEYS } from 'src/front-components/constants/call-recorder-settings-layout.constant';
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

const getInitialApplicationVariables = (): CallRecorderApplicationVariable[] =>
  CALL_RECORDER_MAPPED_VARIABLE_KEYS.map((key) => ({
    key,
    label: '',
    value: getApplicationVariable(key) ?? '',
    description: '',
    isSecret: false,
    isDeprecated: false,
    type: '',
    options: null,
  }));

const getApplicationVariablesLoadingState =
  (): CallRecorderApplicationVariablesState => ({
    applicationId: undefined,
    applicationVariables: getInitialApplicationVariables(),
    isApplicationVariablesQueryLoading: true,
    errorMessage: undefined,
  });

export const useCallRecorderApplicationVariables =
  (): CallRecorderApplicationVariablesState => {
    const frontComponentId = useFrontComponentId();
    const [state, setState] = useState<CallRecorderApplicationVariablesState>(
      getApplicationVariablesLoadingState,
    );

    useEffect(() => {
      const abortController = new AbortController();

      setState((currentState) => ({
        ...currentState,
        applicationId: undefined,
        isApplicationVariablesQueryLoading: true,
        errorMessage: undefined,
      }));

      const fetchApplicationVariables = async () => {
        try {
          const client = new MetadataApiClient({
            signal: abortController.signal,
          });
          const frontComponentResult = await client.query({
            frontComponent: {
              __args: { id: frontComponentId },
              applicationId: true,
            },
          });

          const applicationId =
            frontComponentResult.frontComponent?.applicationId;

          if (abortController.signal.aborted) {
            return;
          }

          if (!isNonEmptyString(applicationId)) {
            setState({
              applicationId: undefined,
              applicationVariables: [],
              isApplicationVariablesQueryLoading: false,
              errorMessage: APPLICATION_VARIABLES_ERROR_MESSAGE,
            });
            return;
          }

          const applicationResult = await client.query({
            findOneApplication: {
              __args: { id: applicationId },
              applicationVariables: {
                key: true,
                label: true,
                value: true,
                description: true,
                isSecret: true,
                isDeprecated: true,
                type: true,
                options: true,
              },
            },
          });

          if (abortController.signal.aborted) {
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
          if (abortController.signal.aborted) {
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

      return () => abortController.abort();
    }, [frontComponentId]);

    return state;
  };
