import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import {
  PermissionFlagType,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';

export const SettingsWorkspaceDefaultSenderDomainSection = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const hasWorkspacePermission = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const savedDomain = currentWorkspace?.defaultSenderDomain ?? '';
  const [domain, setDomain] = useState(savedDomain);

  const handleBlur = async () => {
    const trimmedDomain = domain.trim();

    if (!isDefined(currentWorkspace) || trimmedDomain === savedDomain) {
      setDomain(trimmedDomain);
      return;
    }

    try {
      const result = await updateWorkspace({
        variables: { input: { defaultSenderDomain: trimmedDomain } },
      });

      // The server normalizes the domain, so show what it stored
      const storedDomain =
        result.data?.updateWorkspace?.defaultSenderDomain ?? null;

      setCurrentWorkspace({
        ...currentWorkspace,
        defaultSenderDomain: storedDomain,
      });
      setDomain(storedDomain ?? '');
    } catch (error) {
      setDomain(savedDomain);
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <Section.Root>
      <SettingsTextInput
        instanceId="workspace-default-sender-domain"
        label={t`Default sending domain`}
        hint={t`New emails start from each member's address at this domain.`}
        value={domain}
        onChange={setDomain}
        onBlur={handleBlur}
        placeholder={t`example.com`}
        disabled={!hasWorkspacePermission}
        fullWidth
      />
    </Section.Root>
  );
};
