import { getSubdomainValidationSchema } from '@/settings/domains/utils/getSubdomainValidationSchema';
import { useApolloClient, useLazyQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import {
  getSubdomainSlugFromDisplayName,
  isDefined,
} from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  CheckWorkspaceSubdomainAvailabilityDocument,
  GetWorkspaceCreationDefaultsDocument,
} from '~/generated-metadata/graphql';

export type SubdomainFieldStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'invalid'
  | 'error';

const AVAILABILITY_CHECK_DEBOUNCE_MS = 400;

export const useWorkspaceSubdomainField = () => {
  const apolloClient = useApolloClient();
  const subdomainSchema = useMemo(() => getSubdomainValidationSchema(), []);

  const defaults = useMemo(
    () =>
      apolloClient.readQuery({
        query: GetWorkspaceCreationDefaultsDocument,
      })?.getWorkspaceCreationDefaults,
    [apolloClient],
  );

  const seededSubdomain = defaults?.subdomain ?? '';

  const [workspaceName, setWorkspaceName] = useState(
    defaults?.displayName ?? '',
  );
  const [subdomain, setSubdomain] = useState(seededSubdomain);
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [status, setStatus] = useState<SubdomainFieldStatus>(
    seededSubdomain !== '' ? 'available' : 'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [suggestion, setSuggestion] = useState<string | undefined>();

  const [checkAvailabilityQuery] = useLazyQuery(
    CheckWorkspaceSubdomainAvailabilityDocument,
    { fetchPolicy: 'no-cache' },
  );

  const runAvailabilityCheck = async (
    value: string,
    { adoptSuggestion }: { adoptSuggestion: boolean },
  ) => {
    try {
      const { data } = await checkAvailabilityQuery({
        variables: { subdomain: value },
      });

      const result = data?.checkWorkspaceSubdomainAvailability;

      if (!isDefined(result)) {
        setStatus('idle');
        return;
      }

      if (adoptSuggestion) {
        setSubdomain(result.suggestedSubdomain);
        setStatus('available');
        setErrorMessage(undefined);
        setSuggestion(undefined);
        return;
      }

      if (!result.isValid) {
        setStatus('invalid');
        setSuggestion(undefined);
        return;
      }

      if (result.available) {
        setStatus('available');
        setSuggestion(undefined);
        return;
      }

      setStatus('unavailable');
      setSuggestion(result.suggestedSubdomain);
    } catch {
      setStatus('error');
      setSuggestion(undefined);
    }
  };

  const debouncedAvailabilityCheck = useDebouncedCallback(
    runAvailabilityCheck,
    AVAILABILITY_CHECK_DEBOUNCE_MS,
  );

  const autofillFromWorkspaceName = (name: string) => {
    const slug = getSubdomainSlugFromDisplayName(name);

    if (!isDefined(slug)) {
      debouncedAvailabilityCheck.cancel();
      setSubdomain('');
      setStatus('idle');
      setSuggestion(undefined);
      return;
    }

    setStatus('checking');
    debouncedAvailabilityCheck(slug, { adoptSuggestion: true });
  };

  const handleWorkspaceNameChange = (name: string) => {
    setWorkspaceName(name);

    if (isManuallyEdited) {
      return;
    }

    autofillFromWorkspaceName(name);
  };

  const handleSubdomainChange = (value: string) => {
    const normalized = value.trim().toLowerCase();

    if (normalized === '') {
      setIsManuallyEdited(false);
      setSubdomain('');
      setErrorMessage(undefined);
      setSuggestion(undefined);
      autofillFromWorkspaceName(workspaceName);
      return;
    }

    setIsManuallyEdited(true);
    setSubdomain(normalized);

    const validation = subdomainSchema.safeParse(normalized);

    if (!validation.success) {
      debouncedAvailabilityCheck.cancel();
      setStatus('invalid');
      setErrorMessage(validation.error.issues[0].message);
      setSuggestion(undefined);
      return;
    }

    setErrorMessage(undefined);
    setStatus('checking');
    debouncedAvailabilityCheck(normalized, { adoptSuggestion: false });
  };

  const applySuggestion = () => {
    if (!isDefined(suggestion)) {
      return;
    }

    setIsManuallyEdited(true);
    setSubdomain(suggestion);
    setStatus('checking');
    setErrorMessage(undefined);
    setSuggestion(undefined);
    debouncedAvailabilityCheck(suggestion, { adoptSuggestion: false });
  };

  return {
    workspaceName,
    subdomain,
    status,
    errorMessage,
    suggestion,
    isAvailable: status === 'available',
    handleWorkspaceNameChange,
    handleSubdomainChange,
    applySuggestion,
  };
};
