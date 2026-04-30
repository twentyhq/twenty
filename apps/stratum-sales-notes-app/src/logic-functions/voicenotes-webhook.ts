import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { VOICENOTES_WEBHOOK_LOGIC_FUNCTION_UID } from 'src/constants/universal-identifiers';

// Inbound HTTP webhook from Voicenotes. Phase C scaffolding only — the
// handler body is intentionally a stub that just logs what we received,
// so we can:
//   1. confirm the SDK 2.1.0 actually wires httpRouteTriggerSettings
//      through at install time (the highest-risk Phase C unknown), and
//   2. start capturing real-shape payloads in Railway logs once the user
//      points Voicenotes at the registered URL.
//
// Phase D will replace the body with the real ingest logic (resolve the
// :userToken to a workspaceMember, upsert salesNote on `recording.created`,
// patch summary on `creation.summary`, etc.). The signing-header design is
// also deferred until the probe (Phase A) tells us what Voicenotes sends.
//
// Logging convention: console.error so APPLICATION_LOG_DRIVER=CONSOLE on
// twenty-worker pipes the line through to Railway. Same convention as
// on-sales-note-created.

const handler = async (
  routePayload: RoutePayload<unknown>,
): Promise<unknown> => {
  // eslint-disable-next-line no-console
  console.error('[voicenotes-webhook] received', {
    headers: routePayload.headers,
    pathParameters: routePayload.pathParameters,
    bodyKeys:
      typeof routePayload.body === 'object' && routePayload.body !== null
        ? Object.keys(routePayload.body as Record<string, unknown>)
        : null,
  });

  return { received: true, todo: 'handler not implemented yet — Phase D' };
};

export default defineLogicFunction({
  universalIdentifier: VOICENOTES_WEBHOOK_LOGIC_FUNCTION_UID,
  name: 'voicenotes-webhook',
  description:
    'Inbound HTTP webhook for Voicenotes. Phase C stub: logs payload + returns 200. Real handler lands in Phase D once the live-probe captures the payload shape.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/webhook/voicenotes/:userToken',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['user-agent', 'content-type'],
  },
});
