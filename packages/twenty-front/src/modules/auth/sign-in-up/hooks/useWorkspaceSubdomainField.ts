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

export const useWorkspaceSubdomainField = ({
  isSubdomainEnabled = true,
}: { isSubdomainEnabled?: boolean } = {}) => {
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
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
        setSuggestions([]);
        return;
      }

      if (!result.isValid) {
        setStatus('invalid');
        setSuggestions([]);
        return;
      }

      if (result.available) {
        setStatus('available');
        setSuggestions([]);
        return;
      }

      setStatus('unavailable');
      setSuggestions(result.suggestedSubdomains);
    } catch {
      setStatus('error');
      setSuggestions([]);
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
      setSuggestions([]);
      return;
    }

    setStatus('checking');
    debouncedAvailabilityCheck(slug, { adoptSuggestion: true });
  };

  const handleWorkspaceNameChange = (name: string) => {
    setWorkspaceName(name);

    if (!isSubdomainEnabled || isManuallyEdited) {
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
      setSuggestions([]);
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
      setSuggestions([]);
      return;
    }

    setErrorMessage(undefined);
    setStatus('checking');
    debouncedAvailabilityCheck(normalized, { adoptSuggestion: false });
  };

  const applySuggestionValue = (value: string) => {
    setIsManuallyEdited(true);
    setSubdomain(value);
    setStatus('checking');
    setErrorMessage(undefined);
    setSuggestions([]);
    debouncedAvailabilityCheck(value, { adoptSuggestion: false });
  };

  return {
    workspaceName,
    subdomain,
    status,
    errorMessage,
    suggestions,
    isAvailable: status === 'available',
    handleWorkspaceNameChange,
    handleSubdomainChange,
    applySuggestionValue,
  };
};
