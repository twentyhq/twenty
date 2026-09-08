import { useLingui } from '@lingui/react/macro';
import { IconCircleDot } from 'twenty-ui/display';

import { useMutation } from '@apollo/client/react';
import { useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ENSO_SET_MY_ROUTING_AVAILABILITY } from '@/enso/routing-availability/graphql/mutations/ensoSetMyRoutingAvailability';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

// Self-service lead-routing presence, like a Slack online/away switch. Flips the
// current workspace member's `isAvailableForRouting` so managers opt themselves
// into / out of round-robin lead routing.
//
// Read with the generic record hook (the field is custom and not on the static
// currentWorkspaceMember type), but WRITTEN through a dedicated mutation: a
// plain workspaceMember update is gated behind the WORKSPACE_MEMBERS settings
// flag, so a sales manager could not toggle their own presence, and granting
// that flag would let them edit colleagues.
export const RoutingPresenceSection = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const workspaceMemberId = currentWorkspaceMember?.id;

  const { record } = useFindOneRecord({
    objectNameSingular: 'workspaceMember',
    objectRecordId: workspaceMemberId,
    skip: !isDefined(workspaceMemberId),
  });

  const [setMyRoutingAvailability] = useMutation<{
    ensoSetMyRoutingAvailability: { isAvailableForRouting: boolean };
  }>(ENSO_SET_MY_ROUTING_AVAILABILITY);

  // The mutation returns a plain payload rather than a record, so the toggle
  // holds its own optimistic value instead of leaning on the record cache.
  const [optimisticIsAvailable, setOptimisticIsAvailable] = useState<
    boolean | null
  >(null);

  if (!isDefined(workspaceMemberId) || !isDefined(record)) {
    return null;
  }

  const isAvailable =
    optimisticIsAvailable ?? record.isAvailableForRouting === true;

  const handleToggle = async () => {
    const nextValue = !isAvailable;

    setOptimisticIsAvailable(nextValue);

    try {
      const result = await setMyRoutingAvailability({
        variables: { isAvailableForRouting: nextValue },
      });

      setOptimisticIsAvailable(
        result.data?.ensoSetMyRoutingAvailability.isAvailableForRouting ??
          nextValue,
      );
    } catch {
      // Put the switch back rather than leaving it showing a state the server
      // never accepted.
      setOptimisticIsAvailable(null);
    }
  };

  return (
    <NavigationDrawerSection>
      <NavigationDrawerItem
        label={isAvailable ? t`Accepting leads` : t`Not accepting leads`}
        Icon={IconCircleDot}
        // Colored status dot: green = accepting, yellow = paused.
        iconColor={isAvailable ? 'green' : 'yellow'}
        onClick={handleToggle}
        active={isAvailable}
      />
    </NavigationDrawerSection>
  );
};
