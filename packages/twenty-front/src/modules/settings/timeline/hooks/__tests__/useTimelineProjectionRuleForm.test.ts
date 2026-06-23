import { act, renderHook } from '@testing-library/react';

import { useTimelineProjectionRuleForm } from '@/settings/timeline/hooks/useTimelineProjectionRuleForm';

const NOTE_ID = 'note-id';
const TASK_ID = 'task-id';
const COMPANY_ID = 'company-id';
const PERSON_ID = 'person-id';

describe('useTimelineProjectionRuleForm', () => {
  it('cannot be saved until an anchor, a source and at least one activity type are set', () => {
    const { result } = renderHook(() =>
      useTimelineProjectionRuleForm([NOTE_ID, TASK_ID]),
    );

    expect(result.current.canSave).toBe(false);

    act(() => result.current.setAnchorObjectMetadataId(COMPANY_ID));
    expect(result.current.canSave).toBe(false);

    act(() => result.current.setSourceObjectMetadataId(PERSON_ID));
    expect(result.current.canSave).toBe(true);
  });

  it('cannot be saved when every activity type is toggled off', () => {
    const { result } = renderHook(() =>
      useTimelineProjectionRuleForm([NOTE_ID, TASK_ID]),
    );

    act(() => {
      result.current.setAnchorObjectMetadataId(COMPANY_ID);
      result.current.setSourceObjectMetadataId(PERSON_ID);
    });
    expect(result.current.canSave).toBe(true);

    act(() => result.current.toggleActivityType(NOTE_ID, false));
    expect(result.current.linkedObjectMetadataIds).toEqual([TASK_ID]);
    expect(result.current.canSave).toBe(true);

    act(() => result.current.toggleActivityType(TASK_ID, false));
    expect(result.current.linkedObjectMetadataIds).toEqual([]);
    expect(result.current.canSave).toBe(false);

    act(() => result.current.toggleActivityType(NOTE_ID, true));
    expect(result.current.linkedObjectMetadataIds).toEqual([NOTE_ID]);
    expect(result.current.canSave).toBe(true);
  });

  it('does not duplicate an activity type toggled on twice', () => {
    const { result } = renderHook(() => useTimelineProjectionRuleForm([]));

    act(() => result.current.toggleActivityType(NOTE_ID, true));
    act(() => result.current.toggleActivityType(NOTE_ID, true));

    expect(result.current.linkedObjectMetadataIds).toEqual([NOTE_ID]);
  });

  it('cannot be saved while a submission is in flight', () => {
    const { result } = renderHook(() =>
      useTimelineProjectionRuleForm([NOTE_ID]),
    );

    act(() => {
      result.current.setAnchorObjectMetadataId(COMPANY_ID);
      result.current.setSourceObjectMetadataId(PERSON_ID);
    });
    expect(result.current.canSave).toBe(true);

    act(() => result.current.setIsSubmitting(true));
    expect(result.current.canSave).toBe(false);
  });
});
