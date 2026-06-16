import { getSubdomainValidationSchema } from '@/settings/domains/utils/getSubdomainValidationSchema';
import { useApolloClient, useLazyQuery } from '@apollo/client/react';
import { useMemo, useRef, useState } from 'react';
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

// Powers the onboarding workspace-creation step. The name and address are
// derived from the user's work email by the backend and preloaded into the
// Apollo cache after sign-in, so this hook seeds both fields synchronously
// without a flash. Editing the name keeps refreshing an available address
// until the user takes manual control of the address field.
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
  // The seeded address was already vetted as available by the backend.
  const [status, setStatus] = useState<SubdomainFieldStatus>(
    seededSubdomain !== '' ? 'available' : 'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [suggestion, setSuggestion] = useState<string | undefined>();

  const [checkAvailabilityQuery] = useLazyQuery(
    CheckWorkspaceSubdomainAvailabilityDocument,
    { fetchPolicy: 'no-cache' },
  );

  // Imperative handle to cancel the previous in-flight check so a slower,
  // earlier response can never overwrite a more recent one (not render state).
  // oxlint-disable-next-line twenty/no-state-useref
  const inFlightCheckRef = useRef<AbortController | null>(null);

  const runAvailabilityCheck = async (
    value: string,
    { adoptSuggestion }: { adoptSuggestion: boolean },
  ) => {
    inFlightCheckRef.current?.abort();
    const abortController = new AbortController();
    inFlightCheckRef.current = abortController;

    try {
      const { data } = await checkAvailabilityQuery({
        variables: { subdomain: value },
        context: { fetchOptions: { signal: abortController.signal } },
      });

      if (abortController.signal.aborted) {
        return;
      }

      const result = data?.checkWorkspaceSubdomainAvailability;

      if (!isDefined(result)) {
        setStatus('idle');
        return;
      }

      // Autofill always lands on an address the backend confirmed is free.
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
      if (!abortController.signal.aborted) {
        setStatus('error');
        setSuggestion(undefined);
      }
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
      inFlightCheckRef.current?.abort();
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

    // Clearing the field hands control back to name-based autofill.
    if (normalized === '') {
      inFlightCheckRef.current?.abort();
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
      inFlightCheckRef.current?.abort();
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
