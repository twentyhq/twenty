import { type Agent } from 'http';

import { describeHttpAgents } from 'src/engine/core-modules/file-storage/utils/describe-http-agents.util';

const buildAgent = ({
  sockets = {},
  freeSockets = {},
  requests = {},
  maxSockets = 200,
}: {
  sockets?: Record<string, unknown[]>;
  freeSockets?: Record<string, unknown[]>;
  requests?: Record<string, unknown[]>;
  maxSockets?: number;
}) => ({ sockets, freeSockets, requests, maxSockets }) as unknown as Agent;

describe('describeHttpAgents', () => {
  it('returns undefined when no agent has been initialized', () => {
    expect(describeHttpAgents([undefined, undefined])).toBeUndefined();
  });

  it('reports a saturated pool with its queued requests', () => {
    const agent = buildAgent({
      sockets: {
        's3.eu-central-1.amazonaws.com:443:': new Array(200).fill({}),
      },
      requests: { 's3.eu-central-1.amazonaws.com:443:': new Array(7).fill({}) },
      maxSockets: 200,
    });

    expect(describeHttpAgents([agent])).toEqual({
      origins: [
        {
          origin: 's3.eu-central-1.amazonaws.com:443:',
          busySockets: 200,
          freeSockets: 0,
          queuedRequests: 7,
        },
      ],
      totalBusySockets: 200,
      totalFreeSockets: 0,
      totalQueuedRequests: 7,
      maxSockets: 200,
    });
  });

  it('reports an idle pool so a timeout can be distinguished from saturation', () => {
    const agent = buildAgent({
      sockets: { 'host:443:': [{}, {}] },
      freeSockets: { 'host:443:': [{}] },
    });

    const snapshot = describeHttpAgents([agent]);

    expect(snapshot?.totalBusySockets).toBe(2);
    expect(snapshot?.totalFreeSockets).toBe(1);
    expect(snapshot?.totalQueuedRequests).toBe(0);
  });

  it('aggregates the http and https agents together', () => {
    const snapshot = describeHttpAgents([
      buildAgent({ sockets: { 'a:443:': [{}] } }),
      buildAgent({ sockets: { 'b:443:': [{}, {}] } }),
    ]);

    expect(snapshot?.origins).toHaveLength(2);
    expect(snapshot?.totalBusySockets).toBe(3);
  });
});
