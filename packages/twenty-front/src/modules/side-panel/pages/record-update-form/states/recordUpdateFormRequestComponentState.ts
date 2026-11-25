import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';

export type RecordUpdateFormRequest = {
  requestId: string;
  objectMetadataId: string;
  draftRecord: Partial<ObjectRecord>;
  previousRecord: Partial<ObjectRecord>;
  fieldMetadataIds: string[];
  violations: ValidationRuleViolation[];
};

export const recordUpdateFormRequestComponentState =
  createAtomComponentState<RecordUpdateFormRequest | null>({
    key: 'side-panel/record-update-form-request',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
