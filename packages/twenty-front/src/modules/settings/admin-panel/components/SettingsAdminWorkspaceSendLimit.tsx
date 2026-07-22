import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { WORKSPACE_LOOKUP_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/workspaceLookupAdminPanel';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { UpdateWorkspaceMessageCampaignDailySendLimitDocument } from '~/generated-admin/graphql';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInputContainer = styled.div`
  flex: 1;
`;

type SettingsAdminWorkspaceSendLimitProps = {
  workspaceId: string;
  messageCampaignDailySendLimit: number | null | undefined;
};

export const SettingsAdminWorkspaceSendLimit = ({
  workspaceId,
  messageCampaignDailySendLimit,
}: SettingsAdminWorkspaceSendLimitProps) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [value, setValue] = useState(
    messageCampaignDailySendLimit?.toString() ?? '',
  );

  const [updateSendLimit, { loading }] = useMutation(
    UpdateWorkspaceMessageCampaignDailySendLimitDocument,
    {
      client: apolloAdminClient,
      refetchQueries: [
        { query: WORKSPACE_LOOKUP_ADMIN_PANEL, variables: { workspaceId } },
      ],
    },
  );

  const trimmedValue = value.trim();
  const parsedLimit = Number(trimmedValue);

  const isValid =
    trimmedValue === '' ||
    (Number.isInteger(parsedLimit) && parsedLimit >= 0 && parsedLimit <= 1000000);

  const handleSave = async () => {
    if (!isValid) {
      return;
    }

    try {
      await updateSendLimit({
        variables: {
          workspaceId,
          dailySendLimit: trimmedValue === '' ? null : parsedLimit,
        },
      });
      enqueueSuccessSnackBar({ message: t`Daily send limit updated` });
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to update the daily send limit` });
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Campaign send limit`}
        description={t`Emails this workspace can send each day. Leave empty to use the default for its plan and domain verification.`}
      />
      <StyledRow>
        <StyledInputContainer>
          <SettingsTextInput
            instanceId="admin-workspace-send-limit"
            value={value}
            onChange={setValue}
            placeholder={t`Default`}
            fullWidth
          />
        </StyledInputContainer>
        <Button
          title={t`Save`}
          onClick={handleSave}
          isLoading={loading}
          disabled={!isValid || loading}
        />
      </StyledRow>
    </Section>
  );
};
