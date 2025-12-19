import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { Card } from 'twenty-ui/layout';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';
import { IconHttpGet, IconTrash } from 'twenty-ui/display';
import styled from '@emotion/styled';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { useDebouncedCallback } from 'use-debounce';

const StyledToggleRequests = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsSecurityOther = () => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const saveWorkspace = useDebouncedCallback(async (value: number) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }

      await updateWorkspace({
        variables: {
          input: {
            trashRetentionDays: value,
          },
        },
      });
    } catch (err) {
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
      });
    }
  }, 500);

  const handleTrashRetentionDaysChange = (value: number) => {
    if (!currentWorkspace) {
      return;
    }

    if (value === currentWorkspace.trashRetentionDays) {
      return;
    }

    setCurrentWorkspace({
      ...currentWorkspace,
      trashRetentionDays: value,
    });

    saveWorkspace(value);
  };

  const handleRequestsChange = async (value: boolean) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }
      await updateWorkspace({
        variables: {
          input: {
            allowExternalRequests: value,
          },
        },
      });
      setCurrentWorkspace({
        ...currentWorkspace,
        allowExternalRequests: value,
      });
    } catch (err: any) {
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
      });
    }
  };

  return (
    <StyledToggleRequests>
      <Card rounded>
        <SettingsOptionCardContentCounter
          Icon={IconTrash}
          title={t`Erasure of soft-deleted records`}
          description={t`Permanent deletion. Enter the number of days.`}
          value={currentWorkspace?.trashRetentionDays ?? 14}
          onChange={handleTrashRetentionDaysChange}
          minValue={0}
          showButtons={false}
        />
      </Card>
      <Card rounded>
        <SettingsOptionCardContentToggle
          Icon={IconHttpGet}
          title={t`Allow requests to twenty-icons`}
          description={t`Grant access to send requests to twenty-icons to show companies' icons.`}
          checked={currentWorkspace?.allowExternalRequests ?? false}
          onChange={handleRequestsChange}
          advancedMode
        />
      </Card>
    </StyledToggleRequests>
  );
};
