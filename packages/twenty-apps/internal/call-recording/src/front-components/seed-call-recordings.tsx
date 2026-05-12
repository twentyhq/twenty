import { useEffect, useState } from 'react';
import {
  SEED_CALL_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
  SEED_CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/seed-call-recordings-universal-identifiers';
import { MOCK_CALL_RECORDINGS } from 'src/data/mock-call-recordings';
import { defineFrontComponent } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-sdk/clients';

type SeedStatus = 'seeding' | 'done' | 'error';

const fetchPeopleIds = async (
  client: InstanceType<typeof CoreApiClient>,
): Promise<string[]> => {
  const result: any = await client.query({
    people: {
      __args: { first: 50 },
      edges: { node: { id: true } },
    },
  } as any);

  return (
    result?.people?.edges?.map(
      (edge: { node: { id: string } }) => edge.node.id,
    ) ?? []
  );
};

const fetchWorkspaceMemberIds = async (
  client: InstanceType<typeof CoreApiClient>,
): Promise<string[]> => {
  const result: any = await client.query({
    workspaceMembers: {
      __args: { first: 50 },
      edges: { node: { id: true } },
    },
  } as any);

  return (
    result?.workspaceMembers?.edges?.map(
      (edge: { node: { id: string } }) => edge.node.id,
    ) ?? []
  );
};

const pickRandom = <T,>(items: T[]): T | undefined =>
  items.length > 0 ? items[Math.floor(Math.random() * items.length)] : undefined;

const SeedCallRecordings = () => {
  const [status, setStatus] = useState<SeedStatus>('seeding');
  const [count, setCount] = useState(0);

  useEffect(() => {
    const seed = async () => {
      try {
        const client = new CoreApiClient();

        const [personIds, workspaceMemberIds] = await Promise.all([
          fetchPeopleIds(client),
          fetchWorkspaceMemberIds(client),
        ]);

        const recordsToCreate = MOCK_CALL_RECORDINGS.map((recording) => ({
          ...recording,
          personId: pickRandom(personIds),
          workspaceMemberId: pickRandom(workspaceMemberIds),
        }));

        await client.mutation({
          createCallRecordings: {
            __args: { data: recordsToCreate as any },
            id: true,
          },
        } as any);

        setCount(recordsToCreate.length);
        setStatus('done');
      } catch {
        setStatus('error');
      }
    };

    seed();
  }, []);

  if (status === 'seeding') {
    return <div>Seeding call recordings...</div>;
  }

  if (status === 'error') {
    return <div>Failed to seed call recordings.</div>;
  }

  return <div>Seeded {count} call recordings.</div>;
};

export default defineFrontComponent({
  universalIdentifier:
    SEED_CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Seed Call Recordings',
  description: 'Seeds the workspace with mock call recordings for testing',
  isHeadless: true,
  component: SeedCallRecordings,
  command: {
    universalIdentifier: SEED_CALL_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'Seed call recordings',
    icon: 'IconDatabase',
    isPinned: false,
    availabilityType: 'GLOBAL',
  },
});
