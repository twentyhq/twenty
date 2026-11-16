import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, normalizeIframeOrigin } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsSecurityAddWebsiteForm } from '@/settings/security/components/SettingsSecurityAddWebsiteForm';
import { SettingsSecurityIframeOriginsTable } from '@/settings/security/components/SettingsSecurityIframeOriginsTable';
import {
  GetWorkspaceAllowedEmbeddingOriginsDocument,
  UpdateWorkspaceAllowedEmbeddingOriginsDocument,
} from '~/generated-metadata/graphql';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
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
  } = useQuery(GetWorkspaceAllowedEmbeddingOriginsDocument, {
    fetchPolicy: 'network-only',
  });
  const [updateOrigins, { loading }] = useMutation(
    UpdateWorkspaceAllowedEmbeddingOriginsDocument,
  );
  const origins = data?.currentWorkspace.allowedEmbeddingOrigins ?? [];
  const isPolicyLoaded = isDefined(
    data?.currentWorkspace.allowedEmbeddingOrigins,
  );
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
      return isDefined(data?.updateWorkspaceAllowedEmbeddingOrigins);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
      return false;
    }
  };

  const handleAddOrigin = async () => {
    const origin = normalizeIframeOrigin(originInput.trim());

    if (!isDefined(origin)) {
      setError(t`Enter an HTTP or HTTPS origin without a path or wildcard.`);

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
        title={t`Embedding this workspace`}
        description={t`Websites allowed to embed this workspace. Only add ones you fully trust.`}
      />
      <StyledContent>
        {isDefined(policyError) && (
          <>
            <Text role="alert">{t`Unable to load embedding settings.`}</Text>
            <Button onClick={() => refetch()}>{t`Retry`}</Button>
          </>
        )}
        <SettingsSecurityAddWebsiteForm
          instanceId="allowed-iframe-origin"
          placeholder="https://portal.example.com"
          value={originInput}
          disabled={isDisabled}
          error={error}
          onChange={(value) => {
            setOriginInput(value);
            setError(undefined);
          }}
          onSubmit={() => void handleAddOrigin()}
        />
        <SettingsSecurityIframeOriginsTable
          disabled={isDisabled}
          origins={origins}
          onRemove={(origin) => void saveOrigin('remove', origin)}
        />
      </StyledContent>
    </Section.Root>
  );
};
