import { styled } from '@linaria/react';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { logError } from '~/utils/logError';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${themeCssVariables.spacing[4]};
  }
`;

type NameFieldProps = {
  autoSave?: boolean;
  onNameUpdate?: (name: string) => void;
};

export const NameField = ({
  autoSave = true,
  onNameUpdate,
}: NameFieldProps) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const [displayName, setDisplayName] = useState(
    currentWorkspace?.displayName ?? '',
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  // TODO: Enhance this with react-web-hook-form (https://www.react-hook-form.com)
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    useDebouncedCallback(async (name: string) => {
      if (isEmpty(name)) return;
      // update local state when workspace name is updated
      setCurrentWorkspace((currentValue) => {
        if (currentValue === null) {
          return null;
        }

        return {
          ...currentValue,
          displayName: name,
        };
      });
      if (isDefined(onNameUpdate)) {
        onNameUpdate(displayName);
      }
      if (!autoSave || !name) {
        return;
      }
      try {
        const result = await updateWorkspace({
          variables: {
            input: {
              displayName: name,
            },
          },
        });

        if (isDefined(result.error) || isUndefinedOrNull(result.data?.updateWorkspace)) {
          throw result.error;
        }
      } catch (error) {
        logError(error);
      }
    }, 500),
    [updateWorkspace, setCurrentWorkspace],
  );

  useEffect(() => {
    debouncedUpdate(displayName);
    return debouncedUpdate.cancel;
  }, [debouncedUpdate, displayName]);

  return (
    <StyledComboInputContainer>
      <SettingsTextInput
        instanceId="workspace-name"
        label={t`Name`}
        value={displayName}
        onChange={setDisplayName}
        placeholder={t`Apple`}
        fullWidth
      />
    </StyledComboInputContainer>
  );
};
