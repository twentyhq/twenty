import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TextInput } from '@/ui/input/components/TextInput';
import { useLingui } from '@lingui/react/macro';
import isEmpty from 'lodash.isempty';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { logError } from '~/utils/logError';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
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
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  const [displayName, setDisplayName] = useState(
    currentWorkspace?.displayName ?? '',
  );

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  // TODO: Enhance this with react-web-hook-form (https://www.react-hook-form.com)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    useDebouncedCallback(async (name: string) => {
      if (isEmpty(name)) return;
      // update local recoil state when workspace name is updated
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
        const { data, errors } = await updateWorkspace({
          variables: {
            input: {
              displayName: name,
            },
          },
        });

        if (isDefined(errors) || isUndefinedOrNull(data?.updateWorkspace)) {
          throw errors;
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
      <TextInput
        label={t`Name`}
        value={displayName}
        onChange={setDisplayName}
        placeholder="Apple"
        fullWidth
      />
    </StyledComboInputContainer>
  );
};
