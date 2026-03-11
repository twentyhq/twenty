import { CoreApiClient } from 'twenty-sdk/clients';

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  platform: string;
}

const parseName = (
  fullName: string,
): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ');

  return { firstName, lastName };
};

const findWorkspaceMember = async (
  client: InstanceType<typeof CoreApiClient>,
  firstName: string,
  lastName: string,
): Promise<string | null> => {
  const result: any = await client.query({
    workspaceMembers: {
      __args: {
        filter: {
          name: {
            firstName: { ilike: `%${firstName}%` },
            lastName: { ilike: `%${lastName}%` },
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: { firstName: true, lastName: true },
        },
      },
    },
  } as any);

  const firstMatch = result.workspaceMembers?.edges?.[0]?.node;

  return firstMatch?.id ?? null;
};

const findPerson = async (
  client: InstanceType<typeof CoreApiClient>,
  firstName: string,
  lastName: string,
): Promise<string | null> => {
  const result: any = await client.query({
    people: {
      __args: {
        filter: {
          name: {
            firstName: { ilike: `%${firstName}%` },
            lastName: { ilike: `%${lastName}%` },
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: { firstName: true, lastName: true },
        },
      },
    },
  } as any);

  const firstMatch = result.people?.edges?.[0]?.node;

  return firstMatch?.id ?? null;
};

export const matchParticipants = async (
  callRecordingId: string,
  participants: Participant[],
): Promise<void> => {
  if (!participants.length) {
    console.log('No participants to match, skipping');

    return;
  }

  const client = new CoreApiClient();

  for (const participant of participants) {
    const { firstName, lastName } = parseName(participant.name);

    if (!firstName) {
      console.log(
        `Skipping participant with empty name: ${participant.id}`,
      );
      continue;
    }

    const workspaceMemberId = await findWorkspaceMember(
      client,
      firstName,
      lastName,
    );

    if (workspaceMemberId) {
      console.log(
        `Matched "${participant.name}" to workspace member ${workspaceMemberId}`,
      );

      await client.mutation({
        updateCallRecording: {
          __args: {
            id: callRecordingId,
            data: { workspaceMemberId },
          },
          id: true,
        },
      } as any);

      continue;
    }

    const personId = await findPerson(client, firstName, lastName);

    if (personId) {
      console.log(
        `Matched "${participant.name}" to person ${personId}`,
      );

      await client.mutation({
        updateCallRecording: {
          __args: {
            id: callRecordingId,
            data: { personId },
          },
          id: true,
        },
      } as any);

      continue;
    }

    console.log(
      `No match found for participant "${participant.name}"`,
    );
  }
};
