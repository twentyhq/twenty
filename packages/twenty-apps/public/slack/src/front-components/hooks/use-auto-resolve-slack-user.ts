import { useEffect, useRef, useState } from 'react';

import { useResolveSlackUser } from 'src/front-components/hooks/use-resolve-slack-user';
import { isResolvableSlackIdentity } from 'src/front-components/utils/is-resolvable-slack-identity.util';
import {
  type SlackResolveInput,
  toSlackResolveInput,
} from 'src/front-components/utils/to-slack-resolve-input.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const AUTO_RESOLVE_DEBOUNCE_MS = 600;

type RawSlackIdentity = {
  slackUserId: string;
  slackTeamId: string;
};

export const useAutoResolveSlackUser = () => {
  const [resolvedUser, setResolvedUser] = useState<SlackResolvedUser | null>(
    null,
  );
  const [resolveError, setResolveError] = useState<string | null>(null);
  const resolveRequestIdRef = useRef(0);
  const autoResolveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { resolveSlackUser, isResolving } = useResolveSlackUser();

  useEffect(() => () => clearTimeout(autoResolveTimerRef.current), []);

  const resolveIdentity = async (input: SlackResolveInput) => {
    const requestId = resolveRequestIdRef.current;

    const result = await resolveSlackUser(input);

    if (requestId !== resolveRequestIdRef.current) {
      return;
    }

    if (!result.success) {
      setResolvedUser(null);
      setResolveError(result.error);
      return;
    }

    setResolvedUser(result.slackUser);
    setResolveError(null);
  };

  const clearResolution = () => {
    resolveRequestIdRef.current += 1;
    clearTimeout(autoResolveTimerRef.current);
    setResolvedUser(null);
    setResolveError(null);
  };

  const onIdentityChange = (rawIdentity: RawSlackIdentity) => {
    clearResolution();

    const input = toSlackResolveInput(rawIdentity);

    if (!isResolvableSlackIdentity(input)) {
      return;
    }

    autoResolveTimerRef.current = setTimeout(() => {
      resolveIdentity(input);
    }, AUTO_RESOLVE_DEBOUNCE_MS);
  };

  const selectResolvedUser = (slackUser: SlackResolvedUser) => {
    clearResolution();
    setResolvedUser(slackUser);
  };

  const resolveNow = (rawIdentity: RawSlackIdentity) => {
    const input = toSlackResolveInput(rawIdentity);

    if (!isResolvableSlackIdentity(input)) {
      setResolveError(
        'Search for the Slack user by name or email, or enter their full Slack user id.',
      );

      return;
    }

    clearResolution();
    resolveIdentity(input);
  };

  return {
    resolvedUser,
    resolveError,
    isResolving,
    onIdentityChange,
    resolveNow,
    selectResolvedUser,
    clearResolution,
  };
};
