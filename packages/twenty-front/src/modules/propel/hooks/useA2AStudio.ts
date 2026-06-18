import { useCallback, useEffect, useState } from 'react';
import {
  createCounterpartyPerson,
  linkCounterpartyToAgreement,
  searchCounterpartyPeople,
} from '@/propel/lib/a2aCrm';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  type A2ADocumentStatus,
  type A2APrefill,
  type A2AStep,
  type A2AVariant,
  type CounterpartyDraft,
  type CounterpartyPerson,
  type CreateDraftRequest,
  type CreateDraftResponse,
  type DiscardResponse,
  type FinalizeResponse,
  type SendChannel,
  type SendRequest,
  type SendResponse,
  type StatusResponse,
} from '@/propel/types/a2a';

// Drives the A2A Studio for ONE opportunity. The step machine:
//
//   prepare → create-draft →  isRera ? signEmbed : (finalize → )  → send → done
//                                       └ embed our recipient      └ junior bake
//
// All server calls go through callPropelRoute('/a2a/*') (server-derived identity —
// we NEVER send an acting-id); the only direct GraphQL writes are the counterparty
// Person create/search/link (a2aCrm.ts), which run under the agent's own token so
// propel-rls applies. Fails soft exactly like useOneOnOneRunner: a null route
// response → the `error` step (a `missing` checklist surfaces as a 422 notice),
// never a throw. An un-sent draft is discarded on unmount (orphan cleanup, plan §8c).

// What the hero needs to keep around once a draft exists.
export interface A2ADraft {
  a2aDocumentId: string;
  documensoDocumentId: string;
  ourRecipientToken: string | null;
  counterpartyRecipientToken: string | null;
  counterpartySigningUrl: string | null;
  isRera: boolean;
}

export interface A2AStudioState {
  step: A2AStep;
  /** Why we're in `error` / a 422 readiness checklist, if any. */
  errorMessage: string | null;
  missing: string[] | null;
  /** The CRM prefill echoed back by create-draft (or the seed prefill). */
  prefill: A2APrefill;
  draft: A2ADraft | null;
  status: A2ADocumentStatus | null;
  signedPdfUrl: string | null;
  auditUrl: string | null;
  /** The linked counterparty Person, if one is set. */
  counterparty: CounterpartyPerson | null;
  creating: boolean;
  finalizing: boolean;
  sending: boolean;

  setPrefill: (patch: Partial<A2APrefill>) => void;
  createDraft: () => Promise<void>;
  /** Called by DocumensoEmbed onDocumentCompleted (RERA path). */
  onEmbedCompleted: () => void;
  send: (channels: SendChannel[]) => Promise<boolean>;
  searchPeople: (term: string) => Promise<CounterpartyPerson[]>;
  linkCounterparty: (person: CounterpartyPerson) => Promise<boolean>;
  createCounterparty: (draft: CounterpartyDraft) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL_MS = 6000;

export const useA2AStudio = (
  opportunityId: string | null,
  variant: A2AVariant,
  seedPrefill: A2APrefill,
): A2AStudioState => {
  const [step, setStep] = useState<A2AStep>('prepare');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[] | null>(null);
  const [prefill, setPrefillState] = useState<A2APrefill>(seedPrefill);
  const [draft, setDraft] = useState<A2ADraft | null>(null);
  const [status, setStatus] = useState<A2ADocumentStatus | null>(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [auditUrl, setAuditUrl] = useState<string | null>(null);
  const [counterparty, setCounterparty] = useState<CounterpartyPerson | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [sending, setSending] = useState(false);

  // A single stable mutable holder for the values the stable callbacks + the
  // unmount cleanup need to read at call-time (the live draft + whether we've
  // sent). Lazily initialized via useState so the object identity is stable
  // across renders without `useRef` (Twenty's no-state-useref rule reserves
  // useRef for DOM element refs only). We keep it in sync each render.
  const [live] = useState<{ draft: A2ADraft | null; sent: boolean }>(() => ({
    draft: null,
    sent: false,
  }));
  live.draft = draft;

  const setPrefill = useCallback((patch: Partial<A2APrefill>) => {
    setPrefillState((cur) => ({ ...cur, ...patch }));
  }, []);

  const createDraft = useCallback(async () => {
    if (opportunityId === null || opportunityId === '') {
      setStep('error');
      setErrorMessage(
        'No opportunity in context — open A2A Studio from a deal.',
      );
      return;
    }
    setCreating(true);
    setErrorMessage(null);
    setMissing(null);
    try {
      const body: CreateDraftRequest = {
        opportunityId,
        variant,
        ...prefill,
      };
      const res = await callPropelRoute<CreateDraftResponse>(
        '/a2a/create-draft',
        body,
      );
      if (res === null) {
        setStep('error');
        setErrorMessage('Could not create the draft. Please try again.');
        return;
      }
      if (res.missing !== undefined && res.missing.length > 0) {
        // 422 not-ready — stay on prepare, surface the checklist.
        setMissing(res.missing);
        setErrorMessage(
          res.error ?? 'A few details are still needed before drafting.',
        );
        return;
      }
      if (res.error !== undefined || res.a2aDocumentId === undefined) {
        setStep('error');
        setErrorMessage(res.error ?? 'Could not create the draft.');
        return;
      }
      const next: A2ADraft = {
        a2aDocumentId: res.a2aDocumentId,
        documensoDocumentId: res.documensoDocumentId ?? '',
        ourRecipientToken: res.ourRecipientToken ?? null,
        counterpartyRecipientToken: res.counterpartyRecipientToken ?? null,
        counterpartySigningUrl: res.counterpartySigningUrl ?? null,
        isRera: res.isRera === true,
      };
      setDraft(next);
      setStatus('DRAFT');
      if (res.prefill !== undefined) {
        setPrefillState((cur) => ({ ...cur, ...res.prefill }));
      }

      if (next.isRera) {
        // RERA agent signs personally in the embed.
        if (next.ourRecipientToken === null) {
          setStep('error');
          setErrorMessage(
            'The signing session is missing — the draft was created but cannot be signed here.',
          );
          return;
        }
        setStep('signEmbed');
      } else {
        // Junior: doc-service bakes the registered agent's signature/stamp; there
        // is no our-side embed (finalize removes our recipient). Bake then skip
        // straight to send.
        setStep('bakeJunior');
        setFinalizing(true);
        const fin = await callPropelRoute<FinalizeResponse>('/a2a/finalize', {
          a2aDocumentId: next.a2aDocumentId,
          documensoDocumentId: next.documensoDocumentId,
          isRera: false,
        });
        setFinalizing(false);
        if (fin === null || fin.error !== undefined) {
          setStep('error');
          setErrorMessage(
            fin?.error ?? 'Could not apply your brokerage signature.',
          );
          return;
        }
        setStep('send');
      }
    } catch {
      setStep('error');
      setErrorMessage('Could not create the draft.');
    } finally {
      setCreating(false);
    }
  }, [opportunityId, variant, prefill]);

  const onEmbedCompleted = useCallback(() => {
    // Our recipient finished signing in the embed → move to send.
    setStep('send');
  }, []);

  const refreshStatus = useCallback(async () => {
    const d = live.draft;
    if (d === null) return;
    const res = await callPropelRoute<StatusResponse>('/a2a/status', {
      a2aDocumentId: d.a2aDocumentId,
    });
    if (res === null) return;
    if (res.status !== undefined) setStatus(res.status);
    if (res.signedPdfUrl !== undefined) setSignedPdfUrl(res.signedPdfUrl);
    if (res.auditUrl !== undefined) setAuditUrl(res.auditUrl);
    if (res.status === 'SIGNED') setStep('done');
  }, [live]);

  const send = useCallback(
    async (channels: SendChannel[]): Promise<boolean> => {
      const d = live.draft;
      if (d === null) return false;
      setSending(true);
      try {
        const body: SendRequest = {
          a2aDocumentId: d.a2aDocumentId,
          channels,
          ...(counterparty !== null
            ? {
                counterpartyPersonId: counterparty.id,
                ...(counterparty.phone !== null && counterparty.phone !== ''
                  ? { counterpartyPhone: counterparty.phone }
                  : {}),
                ...(counterparty.email !== null && counterparty.email !== ''
                  ? { counterpartyEmail: counterparty.email }
                  : {}),
              }
            : {}),
        };
        const res = await callPropelRoute<SendResponse>('/a2a/send', body);
        if (res === null || res.error !== undefined || res.ok === false) {
          setErrorMessage(res?.error ?? 'Could not send to the counterparty.');
          return false;
        }
        live.sent = true;
        setStatus(res.status ?? 'OUT_FOR_SIGNATURE');
        if (res.counterpartySigningUrl !== undefined) {
          setDraft((cur) =>
            cur === null
              ? cur
              : {
                  ...cur,
                  counterpartySigningUrl:
                    res.counterpartySigningUrl ?? cur.counterpartySigningUrl,
                },
          );
        }
        return true;
      } finally {
        setSending(false);
      }
    },
    [counterparty, live],
  );

  const searchPeople = useCallback(
    (term: string) => searchCounterpartyPeople(term),
    [],
  );

  const linkCounterparty = useCallback(
    async (person: CounterpartyPerson): Promise<boolean> => {
      const d = live.draft;
      // Always remember the selection so SendPanel can light its channels even
      // before a draft exists (the form may set the counterparty first).
      setCounterparty(person);
      if (d === null) return true;
      return linkCounterpartyToAgreement(d.a2aDocumentId, person.id);
    },
    [live],
  );

  const createCounterparty = useCallback(
    async (draftPerson: CounterpartyDraft): Promise<boolean> => {
      const created = await createCounterpartyPerson(draftPerson);
      if (created === null) return false;
      return linkCounterparty(created);
    },
    [linkCounterparty],
  );

  const reset = useCallback(() => {
    live.sent = false;
    live.draft = null;
    setStep('prepare');
    setErrorMessage(null);
    setMissing(null);
    setDraft(null);
    setStatus(null);
    setSignedPdfUrl(null);
    setAuditUrl(null);
    setCounterparty(null);
  }, [live]);

  // Poll status while the doc is out for signature, so the strip + the flip to
  // `done` happen without a manual refresh.
  useEffect(() => {
    if (draft === null) return;
    if (status !== 'OUT_FOR_SIGNATURE') return;
    const id = setInterval(() => {
      void refreshStatus();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [draft, status, refreshStatus]);

  // Orphan cleanup (plan §8c): if the agent abandons an un-sent draft (unmount),
  // discard it server-side so we don't leak a Documenso draft + DRAFT
  // agreementDocument. Fire-and-forget — the page is already gone.
  useEffect(() => {
    return () => {
      const d = live.draft;
      if (d !== null && !live.sent) {
        void callPropelRoute<DiscardResponse>('/a2a/discard', {
          a2aDocumentId: d.a2aDocumentId,
        });
      }
    };
  }, [live]);

  return {
    step,
    errorMessage,
    missing,
    prefill,
    draft,
    status,
    signedPdfUrl,
    auditUrl,
    counterparty,
    creating,
    finalizing,
    sending,
    setPrefill,
    createDraft,
    onEmbedCompleted,
    send,
    searchPeople,
    linkCounterparty,
    createCounterparty,
    refreshStatus,
    reset,
  };
};
