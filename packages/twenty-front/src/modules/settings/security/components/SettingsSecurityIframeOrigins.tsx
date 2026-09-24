import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { MAX_ALLOWED_IFRAME_ORIGINS } from 'twenty-shared/constants';
import { isDefined, normalizeAllowedIframeOrigin } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconPlus, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import {
  GetWorkspaceIframeOriginsDocument,
  UpdateWorkspaceAllowedIframeOriginsDocument,
} from '~/generated-metadata/graphql';

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
  const {
    data,
    loading: isLoadingPolicy,
    error: policyError,
    refetch,
  } = useQuery(GetWorkspaceIframeOriginsDocument, {
    fetchPolicy: 'network-only',
  });
  const [updateOrigins, { loading }] = useMutation(
    UpdateWorkspaceAllowedIframeOriginsDocument,
  );
  const origins = data?.currentWorkspace.allowedIframeOrigins ?? [];
  const isPolicyLoaded = isDefined(data?.currentWorkspace.allowedIframeOrigins);
  const hasReachedOriginLimit = origins.length >= MAX_ALLOWED_IFRAME_ORIGINS;
  const isDisabled = loading || isLoadingPolicy || !isPolicyLoaded;

  const saveOrigin = async (
    operation: 'add' | 'remove',
    origin: string,
  ): Promise<boolean> => {
    if (isDisabled) {
      return false;
    }

    try {
      const { data } = await updateOrigins({
        variables: { input: { operation, origin } },
      });
      return isDefined(data?.updateWorkspaceAllowedIframeOrigins);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
      return false;
    }
  };

  const handleAddOrigin = async () => {
    const origin = normalizeAllowedIframeOrigin(originInput.trim());

    if (!isDefined(origin)) {
      setError(
        t`Enter an HTTP or HTTPS origin without a path or wildcard, such as https://portal.example.com.`,
      );

      return;
    }

    if (origins.includes(origin)) {
      setError(t`This origin is already allowed.`);

      return;
    }

    if (hasReachedOriginLimit) {
      setError(t`You can allow up to ${MAX_ALLOWED_IFRAME_ORIGINS} origins.`);

      return;
    }

    if (await saveOrigin('add', origin)) {
      setOriginInput('');
      setError(undefined);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Iframe embedding`}
        description={t`Allow trusted websites to display this workspace in an iframe. Users who are already signed in may see their workspace inside those websites, so only add origins you fully trust. Leave the list empty to block external embedding.`}
      />
      <StyledList>
        {isDefined(policyError) && (
          <>
            <StyledOrigin role="alert">{t`Unable to load embedding settings.`}</StyledOrigin>
            <Button onClick={() => refetch()}>{t`Retry`}</Button>
          </>
        )}
        {origins.map((origin) => (
          <StyledRow key={origin}>
            <StyledOrigin>{origin}</StyledOrigin>
            <Button
              aria-label={t`Remove ${origin}`}
              startIcon={<IconTrash size={16} />}
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => saveOrigin('remove', origin)}
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
          disabled={isDisabled || hasReachedOriginLimit}
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
              isDisabled || originInput.trim() === '' || hasReachedOriginLimit
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
