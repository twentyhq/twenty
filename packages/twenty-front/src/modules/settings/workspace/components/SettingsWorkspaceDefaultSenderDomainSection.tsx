import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { getSenderDomainOptionsFromAccounts } from '@/settings/workspace/utils/getSenderDomainOptionsFromAccounts';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import {
  PermissionFlagType,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';

const OTHER_DOMAIN_VALUE = '__other-domain__';

type DomainSelectValue = string | null;

export const SettingsWorkspaceDefaultSenderDomainSection = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);
  const hasWorkspacePermission = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const savedDomain = currentWorkspace?.defaultSenderDomain ?? null;
  const [domain, setDomain] = useState(savedDomain ?? '');
  const [isOtherDomainSelected, setIsOtherDomainSelected] = useState(false);

  const accountDomains = getSenderDomainOptionsFromAccounts(
    myConnectedAccounts ?? [],
  );
  const listedDomains =
    isDefined(savedDomain) && !accountDomains.includes(savedDomain)
      ? [...accountDomains, savedDomain]
      : accountDomains;

  const options: SelectOption<DomainSelectValue | typeof OTHER_DOMAIN_VALUE>[] =
    [
      { label: t`None`, value: null },
      ...listedDomains.map((listedDomain) => ({
        label: listedDomain,
        value: listedDomain,
      })),
      { label: t`Other domain…`, value: OTHER_DOMAIN_VALUE },
    ];

  const saveDomain = async (
    nextDomain: string,
  ): Promise<{ isSaved: boolean }> => {
    try {
      const result = await updateWorkspace({
        variables: {
          input: {
            defaultSenderDomain: nextDomain === '' ? null : nextDomain,
          },
        },
      });

      // The server normalizes the domain, so show what it stored
      const storedDomain =
        result.data?.updateWorkspace?.defaultSenderDomain ?? null;

      setCurrentWorkspace((previousWorkspace) =>
        isDefined(previousWorkspace)
          ? { ...previousWorkspace, defaultSenderDomain: storedDomain }
          : previousWorkspace,
      );
      setDomain(storedDomain ?? '');

      return { isSaved: true };
    } catch (error) {
      setDomain(savedDomain ?? '');
      enqueueToast(getToastOptionsFromError({ error }));

      return { isSaved: false };
    }
  };

  const handleSelectChange = async (
    value: DomainSelectValue | typeof OTHER_DOMAIN_VALUE,
  ) => {
    if (value === OTHER_DOMAIN_VALUE) {
      setDomain(savedDomain ?? '');
      setIsOtherDomainSelected(true);
      return;
    }

    setIsOtherDomainSelected(false);

    if (value !== savedDomain) {
      await saveDomain(value ?? '');
    }
  };

  const handleBlur = async () => {
    const trimmedDomain = domain.trim();

    if (!isDefined(currentWorkspace) || trimmedDomain === (savedDomain ?? '')) {
      setDomain(trimmedDomain);
      return;
    }

    const { isSaved } = await saveDomain(trimmedDomain);

    if (isSaved) {
      setIsOtherDomainSelected(false);
    }
  };

  return (
    <Section.Root>
      <Select
        dropdownId="workspace-default-sender-domain-select"
        label={t`Default sending domain`}
        description={t`New emails start from each member's address at this domain.`}
        value={isOtherDomainSelected ? OTHER_DOMAIN_VALUE : savedDomain}
        onChange={handleSelectChange}
        options={options}
        disabled={!hasWorkspacePermission}
        fullWidth
      />
      {isOtherDomainSelected && (
        <SettingsTextInput
          instanceId="workspace-default-sender-domain"
          aria-label={t`Default sending domain`}
          value={domain}
          onChange={setDomain}
          onBlur={handleBlur}
          placeholder={t`example.com`}
          disabled={!hasWorkspacePermission}
          autoFocusOnMount
          fullWidth
        />
      )}
    </Section.Root>
  );
};
