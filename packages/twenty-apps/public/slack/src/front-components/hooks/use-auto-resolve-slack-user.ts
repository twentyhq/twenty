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
  email: string;
  slackUserId: string;
  slackTeamId: string;
};

// Resolves the Slack user as the admin types, like a picker: once the
// identity looks complete and the typing pauses, look it up; any further edit
// invalidates the match and whatever request is still in flight.
export const useAutoResolveSlackUser = () => {
  const [resolvedUser, setResolvedUser] = useState<SlackResolvedUser | null>(
    null,
  );
  const [resolveError, setResolveError] = useState<string | null>(null);
  // Bumps whenever the Slack identity changes, so a resolve that is already in
  // flight against an earlier identity does not restore a stale match.
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

  // For the roster picker: the option already carries the full identity, so
  // it becomes the confirmed match directly, invalidating any lookup in flight.
  const selectResolvedUser = (slackUser: SlackResolvedUser) => {
    clearResolution();
    setResolvedUser(slackUser);
  };

  // Skips the debounce, for Enter while no match is confirmed yet.
  const resolveNow = (rawIdentity: RawSlackIdentity) => {
    const input = toSlackResolveInput(rawIdentity);

    if (!isResolvableSlackIdentity(input) || isResolving) {
      return;
    }

    clearTimeout(autoResolveTimerRef.current);
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
