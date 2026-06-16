import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  type ActivateSequenceResponse,
  type SaveSequenceResponse,
  type SequenceAction,
  type SequenceStepDraft,
  type SequenceTestSendResponse,
} from '@/propel/types/sequenceEditor';

// Thin, faithful wrappers over the THREE existing Propel sequence routes. NO new
// route is added or renamed — these POST exactly what the in-sandbox SequenceEditor
// posted:
//   • POST /s/marketing/save-sequence    (create / update + wholesale step replace)
//   • POST /s/marketing/activate-sequence (lifecycle: activate|pause|archive|stop_everyone)
//   • POST /s/marketing/sequence-test-send (renders + emails step 1 to the coordinator)
//
// The save route IGNORES `steps` on create (the new id doesn't exist yet), so the
// caller must save once to mint the id, then re-save WITH the id so the step
// replacement runs. saveSequence encapsulates that two-phase dance, identical to the
// in-sandbox editor's `save()`.

export interface SaveSequenceInput {
  sequenceId?: string;
  name: string;
  entryType: 'SEGMENT_POLL' | 'MANUAL' | 'EVENT';
  entrySegmentId: string;
  steps: SequenceStepDraft[];
}

// Shape each step exactly as the route expects (undefined where the in-sandbox
// editor omitted a field, so the route's `typeof === 'string'` / `=== 'EMAIL'`
// guards behave identically). Branch targets ride as yes/no INDEX (the route
// resolves them to sibling ids after creation).
const toWireSteps = (steps: SequenceStepDraft[]): object[] =>
  steps.map((s, i) => ({
    name: s.name.trim() || `Step ${i + 1}`,
    stepType: s.stepType,
    channel: s.channel ?? undefined,
    waitDays: s.waitDays ?? undefined,
    templateSubject: s.templateSubject ?? undefined,
    templateBody: s.templateBody ?? undefined,
    conditionKind: s.conditionKind ?? undefined,
    whatsappTemplateId: s.whatsappTemplateId ?? undefined,
    whatsappLanguageCode: s.whatsappLanguageCode ?? undefined,
    yesStepIndex: s.yesStepIndex ?? undefined,
    noStepIndex: s.noStepIndex ?? undefined,
  }));

export const saveSequence = async (
  input: SaveSequenceInput,
): Promise<SaveSequenceResponse | null> => {
  const body: Record<string, unknown> = {
    name: input.name.trim(),
    entryType: input.entryType,
    entrySegmentId:
      input.entryType === 'SEGMENT_POLL' ? input.entrySegmentId : '',
    steps: toWireSteps(input.steps),
  };
  if (input.sequenceId) body.sequenceId = input.sequenceId;

  let res = await callPropelRoute<SaveSequenceResponse>(
    '/marketing/save-sequence',
    body,
  );

  // create path mints the id but ignores steps — re-save WITH the id so the
  // wholesale step replacement runs against the freshly-created sequence.
  if (!input.sequenceId && res?.sequenceId) {
    res = await callPropelRoute<SaveSequenceResponse>(
      '/marketing/save-sequence',
      { ...body, sequenceId: res.sequenceId },
    );
  }
  return res;
};

export const transitionSequence = async (
  sequenceId: string,
  action: SequenceAction,
): Promise<ActivateSequenceResponse | null> =>
  callPropelRoute<ActivateSequenceResponse>('/marketing/activate-sequence', {
    sequenceId,
    action,
  });

export const testSendSequence = async (
  sequenceId: string,
  stepId?: string,
): Promise<SequenceTestSendResponse | null> =>
  callPropelRoute<SequenceTestSendResponse>('/marketing/sequence-test-send', {
    sequenceId,
    ...(stepId ? { stepId } : {}),
  });
