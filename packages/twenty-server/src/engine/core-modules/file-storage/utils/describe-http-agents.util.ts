import { type Agent } from 'http';

export type HttpAgentSnapshot = {
  origins: {
    origin: string;
    busySockets: number;
    freeSockets: number;
    queuedRequests: number;
  }[];
  totalBusySockets: number;
  totalFreeSockets: number;
  totalQueuedRequests: number;
  maxSockets: number;
};

const countByOrigin = (pool: Record<string, unknown[]> | undefined) =>
  Object.entries(pool ?? {}).reduce<Record<string, number>>(
    (counts, [origin, entries]) => ({
      ...counts,
      [origin]: entries?.length ?? 0,
    }),
    {},
  );

export const describeHttpAgents = (
  agents: (Agent | undefined)[],
): HttpAgentSnapshot | undefined => {
  const definedAgents = agents.filter((agent): agent is Agent =>
    Boolean(agent),
  );

  if (definedAgents.length === 0) {
    return undefined;
  }

  const origins = definedAgents.flatMap((agent) => {
    const busy = countByOrigin(
      agent.sockets as unknown as Record<string, unknown[]>,
    );
    const free = countByOrigin(
      agent.freeSockets as unknown as Record<string, unknown[]>,
    );
    const queued = countByOrigin(
      agent.requests as unknown as Record<string, unknown[]>,
    );

    return Array.from(
      new Set([
        ...Object.keys(busy),
        ...Object.keys(free),
        ...Object.keys(queued),
      ]),
    ).map((origin) => ({
      origin,
      busySockets: busy[origin] ?? 0,
      freeSockets: free[origin] ?? 0,
      queuedRequests: queued[origin] ?? 0,
    }));
  });

  return {
    origins,
    totalBusySockets: origins.reduce((sum, o) => sum + o.busySockets, 0),
    totalFreeSockets: origins.reduce((sum, o) => sum + o.freeSockets, 0),
    totalQueuedRequests: origins.reduce((sum, o) => sum + o.queuedRequests, 0),
    maxSockets: definedAgents[0].maxSockets,
  };
};
