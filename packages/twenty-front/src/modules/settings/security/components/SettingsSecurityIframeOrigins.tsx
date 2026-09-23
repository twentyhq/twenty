import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, normalizeAllowedIframeOrigin } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconPlus, IconTrash } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledOrigin = styled.span`
  overflow-wrap: anywhere;
`;

export const SettingsSecurityIframeOrigins = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [originInput, setOriginInput] = useState('');
  const [error, setError] = useState<string>();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace, { loading }] = useMutation(UpdateWorkspaceDocument);
  const origins = currentWorkspace?.allowedIframeOrigins ?? [];

  const saveOrigins = async (
    allowedIframeOrigins: string[],
  ): Promise<boolean> => {
    if (!isDefined(currentWorkspace) || loading) {
      return false;
    }

    const workspaceId = currentWorkspace.id;

    try {
      const { data } = await updateWorkspace({
        variables: { input: { allowedIframeOrigins } },
      });

      if (!isDefined(data?.updateWorkspace)) {
        return false;
      }

      setCurrentWorkspace((workspace) =>
        workspace?.id === workspaceId
          ? {
              ...workspace,
              allowedIframeOrigins: data.updateWorkspace.allowedIframeOrigins,
            }
          : workspace,
      );

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  const handleAddOrigin = async () => {
    const origin = normalizeAllowedIframeOrigin(originInput.trim());

    if (!isDefined(origin)) {
      setError(
        t`Enter an HTTPS origin without a path or wildcard, such as https://portal.example.com.`,
      );

      return;
    }

    if (origins.includes(origin)) {
      setError(t`This origin is already allowed.`);

      return;
    }

    if (origins.length >= 20) {
      setError(t`You can allow up to 20 origins.`);

      return;
    }

    if (await saveOrigins([...origins, origin])) {
      setOriginInput('');
      setError(undefined);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Iframe embedding`}
        description={t`Allow trusted websites to display this workspace in an iframe. Users still need to sign in. Leave the list empty to block external embedding.`}
      />
      <StyledList>
        {origins.map((origin) => (
          <StyledRow key={origin}>
            <StyledOrigin>{origin}</StyledOrigin>
            <Button
              aria-label={t`Remove ${origin}`}
              startIcon={<IconTrash size={16} />}
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() =>
                saveOrigins(origins.filter((value) => value !== origin))
              }
            >
              {t`Remove`}
            </Button>
          </StyledRow>
        ))}
        <SettingsTextInput
          instanceId="allowed-iframe-origin"
          label={t`Allowed origin`}
          placeholder="https://portal.example.com"
          value={originInput}
          disabled={loading || !currentWorkspace || origins.length >= 20}
          onChange={(value) => {
            setOriginInput(value);
            setError(undefined);
          }}
          onInputEnter={handleAddOrigin}
          error={error}
        />
        <StyledRow>
          <Button
            variant="outline"
            size="sm"
            disabled={
              loading ||
              !currentWorkspace ||
              originInput.trim() === '' ||
              origins.length >= 20
            }
            startIcon={<IconPlus size={16} />}
            onClick={handleAddOrigin}
          >
            {t`Add origin`}
          </Button>
        </StyledRow>
      </StyledList>
    </Section.Root>
  );
};
